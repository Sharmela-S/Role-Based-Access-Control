from fastapi import Depends, HTTPException, status
from auth import get_current_user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    user_role = current_user.get("role")
    print(f"🔍 Checking principal access - Role: {user_role}")

    if user_role != "principal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Principal role required. Your role: {user_role}"
        )

    return current_user
