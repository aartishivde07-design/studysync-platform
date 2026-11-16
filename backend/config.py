import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'studysync-secret-key-development-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'studysync-jwt-secret-development-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # SQLite Database location: backend/instance/studysync.db
    instance_path = os.path.join(basedir, 'instance')
    os.makedirs(instance_path, exist_ok=True)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        f"sqlite:///{os.path.join(instance_path, 'studysync.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Matching algorithm weights (configurable)
    MATCH_WEIGHT_SKILLS = 0.40          # 40% Required skill coverage
    MATCH_WEIGHT_INTERESTS = 0.20       # 20% Student interests
    MATCH_WEIGHT_AVAILABILITY = 0.20    # 20% Availability compatibility
    MATCH_WEIGHT_LEARNING_GOALS = 0.10  # 10% Learning goals
    MATCH_WEIGHT_PROFICIENCY = 0.10     # 10% Skill proficiency suitability
