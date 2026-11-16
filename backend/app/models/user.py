from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    academic_year = db.Column(db.String(50), nullable=False)  # e.g., '1st Year', '2nd Year', '3rd Year', '4th Year'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    user_skills = db.relationship('UserSkill', backref='user', cascade='all, delete-orphan', lazy='joined')
    user_interests = db.relationship('UserInterest', backref='user', cascade='all, delete-orphan', lazy='joined')
    created_projects = db.relationship('Project', backref='creator', cascade='all, delete-orphan', foreign_keys='Project.creator_id')
    sent_requests = db.relationship('JoinRequest', backref='applicant', cascade='all, delete-orphan', foreign_keys='JoinRequest.applicant_id')
    team_memberships = db.relationship('TeamMember', backref='user', cascade='all, delete-orphan')
    study_group_memberships = db.relationship('StudyGroupMember', backref='user', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', cascade='all, delete-orphan', order_by='desc(Notification.created_at)')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_profile=True):
        data = {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'department': self.department,
            'academic_year': self.academic_year,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_profile and self.profile:
            data['profile'] = self.profile.to_dict(include_user=False)
        elif include_profile:
            data['profile'] = None

        if self.user_skills:
            data['skills'] = [us.to_dict() for us in self.user_skills]
        else:
            data['skills'] = []

        if self.user_interests:
            data['interests'] = [ui.to_dict() for ui in self.user_interests]
        else:
            data['interests'] = []

        return data


class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    college_name = db.Column(db.String(150), default='')
    college_email = db.Column(db.String(120), default='')
    department = db.Column(db.String(100), default='')
    academic_year = db.Column(db.String(50), default='')
    avatar_url = db.Column(db.String(255), default='')
    bio = db.Column(db.Text, default='')
    learning_goals = db.Column(db.Text, default='')
    preferred_domains = db.Column(db.String(255), default='')  # Comma-separated or JSON list
    availability = db.Column(db.String(100), default='10-15 hrs/week')  # e.g., '5-10 hrs/week', '10-15 hrs/week', '15+ hrs/week', 'Weekends only'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_user=True):
        domains = [d.strip() for d in self.preferred_domains.split(',') if d.strip()] if self.preferred_domains else []
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'college_name': self.college_name,
            'college_email': self.college_email or '',
            'department': self.department,
            'academic_year': self.academic_year,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'learning_goals': self.learning_goals,
            'preferred_domains': domains,
            'availability': self.availability,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_user and self.user:
            data['full_name'] = self.user.full_name
            data['email'] = self.user.email
        return data
