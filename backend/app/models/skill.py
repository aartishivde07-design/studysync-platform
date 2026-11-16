from datetime import datetime
from app.extensions import db

class Skill(db.Model):
    __tablename__ = 'skills'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False, index=True)
    category = db.Column(db.String(50), default='General')  # e.g., 'Frontend', 'Backend', 'AI/ML', 'Mobile'

    user_skills = db.relationship('UserSkill', backref='skill', cascade='all, delete-orphan')
    project_skills = db.relationship('ProjectRequiredSkill', backref='skill', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category
        }


class UserSkill(db.Model):
    __tablename__ = 'user_skills'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)
    proficiency = db.Column(db.String(20), nullable=False, default='Intermediate')  # 'Beginner', 'Intermediate', 'Advanced'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'skill_id', name='uq_user_skill'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'skill_id': self.skill_id,
            'skill_name': self.skill.name if self.skill else None,
            'category': self.skill.category if self.skill else None,
            'proficiency': self.proficiency
        }


class Interest(db.Model):
    __tablename__ = 'interests'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False, index=True)
    category = db.Column(db.String(50), default='General')

    user_interests = db.relationship('UserInterest', backref='interest', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category
        }


class UserInterest(db.Model):
    __tablename__ = 'user_interests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    interest_id = db.Column(db.Integer, db.ForeignKey('interests.id', ondelete='CASCADE'), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'interest_id', name='uq_user_interest'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'interest_id': self.interest_id,
            'name': self.interest.name if self.interest else None,
            'category': self.interest.category if self.interest else None
        }
