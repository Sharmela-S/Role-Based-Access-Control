from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = "mongodb+srv://user:sharme26@cluster0.rqglcwr.mongodb.net/?appName=Cluster0"
DATABASE_NAME = "rbac_system"

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]
users_collection = db.users

print("✅ MongoDB connected successfully")
