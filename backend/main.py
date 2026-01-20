from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import timedelta
from bson import ObjectId

from database import users_collection, DATABASE_NAME
from models import (
    LoginRequest, Token,
    UserCreate, UserUpdate, UserResponse
)
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

from roles import get_admin_user

app = FastAPI(title="RBAC System API") 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    count = await users_collection.count_documents({})
    if count == 0:
        await users_collection.insert_many([
            {
                "name": "Principal User",
                "email": "principal@school.com",
                "password": get_password_hash("principal123"),
                "role": "principal"
            },
            {
                "name": "Teacher User",
                "email": "teacher@school.com",
                "password": get_password_hash("teacher123"),
                "role": "teacher"
            },
            {
                "name": "Student User",
                "email": "student@school.com",
                "password": get_password_hash("student123"),
                "role": "student"
            }
        ])
        print("✅ Default users created successfully")

    print(f"✅ Connected to MongoDB - Database: {DATABASE_NAME}")

@app.get("/") # this api check whether the backend is running or not
async def root():
    return {"message": "RBAC System API", "status": "running"}

@app.post("/auth/login", response_model=Token)  #This API verifies user credentials and generates a JWT token for secure authentication
async def login(login_data: LoginRequest):
    user = await users_collection.find_one(
        {"email": login_data.email.lower()}
    )
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(
        {"sub": user["email"]},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=UserResponse) #This API is used to get the currently logged-in user details
async def read_users_me(current_user=Depends(get_current_user)):
    current_user["_id"] = str(current_user["_id"])
    return current_user

@app.get("/users")  #pagination with search and filter
async def list_users(
    page: int = 1,
    limit: int = 10,
    search: str = None,  # Search parameter for name and email
    role: str = None,    # Filter parameter for role
    current_user=Depends(get_admin_user)
):
    skip = (page - 1) * limit
    
    # Build query filter
    query = {}
    
    # Add search condition (searches in name and email)
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    # Add role filter
    if role:
        query["role"] = role.lower()
    
    # Apply query filter
    total = await users_collection.count_documents(query)
    cursor = users_collection.find(query).skip(skip).limit(limit)

    users = []
    async for user in cursor:
        user["_id"] = str(user["_id"]) #conerted to string
        users.append(user) 

    total_pages = (total + limit - 1) // limit

    return {
        "users": users,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages
    }


@app.post("/users", response_model=UserResponse, status_code=201)  # in this admin can create new user 
async def create_user(
    user: UserCreate,
    current_user=Depends(get_admin_user)
):
    if await users_collection.find_one({"email": user.email.lower()}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = {
        "name": user.name,
        "email": user.email.lower(),
        "password": get_password_hash(user.password),
        "role": user.role
    }

    result = await users_collection.insert_one(user_dict)
    created = await users_collection.find_one({"_id": result.inserted_id})
    created["_id"] = str(created["_id"])
    return created


@app.put("/users/{user_id}", response_model=UserResponse)  # update user
async def update_user(
    user_id: str, 
    user_update: UserUpdate, 
    current_user=Depends(get_admin_user)
):
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await users_collection.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Filter out None values
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    if "password" in update_data:
        update_data["password"] = get_password_hash(update_data["password"])

    if update_data:
        await users_collection.update_one(
            {"_id": user_obj_id},
            {"$set": update_data}
        )
    
    updated_user = await users_collection.find_one({"_id": user_obj_id})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user


@app.delete("/users/{user_id}") #delete user
async def delete_user(
    user_id: str, 
    current_user=Depends(get_admin_user)
):
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    delete_result = await users_collection.delete_one({"_id": user_obj_id})
    
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "User deleted successfully"}