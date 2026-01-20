#from database import users_collection
#from auth import get_password_hash
#import asyncio

#async def restore_admin():
    # Check if admin already exists to avoid duplicates
    #existing_admin = await users_collection.find_one({"email": "principal@school.com"})
    #if existing_admin:
       # print("❌ Admin account (principal@school.com) already exists.")
       # return
    #admin_user = {
       # "name": "Principal User",
        #"email": "principal@school.com",
        #"password": get_password_hash("principal123"),
        #"role": "principal"
    #}
    
    #await users_collection.insert_one(admin_user)
    #print("✅ Admin account restored successfully!")
    #print("Email: principal@school.com")
    #print("Password: principal123")

#if __name__ == "__main__":
   # asyncio.run(restore_admin())#
#