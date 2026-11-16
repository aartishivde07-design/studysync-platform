import re

def is_valid_email(email: str) -> bool:
    """Validates standard email formatting."""
    if not email or not isinstance(email, str):
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email.strip()) is not None

def validate_registration_payload(data: dict) -> tuple[bool, str]:
    """Validates required registration fields."""
    if not data:
        return False, "Request body is missing"

    required_fields = ['full_name', 'email', 'password', 'confirm_password', 'department', 'academic_year']
    for field in required_fields:
        if not data.get(field) or not str(data.get(field)).strip():
            return False, f"Field '{field}' is required and cannot be empty"

    email = data.get('email', '').strip()
    if not is_valid_email(email):
        return False, "Invalid email address format"

    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')
    if password != confirm_password:
        return False, "Passwords do not match"

    if len(password) < 6:
        return False, "Password must be at least 6 characters long"

    return True, ""
