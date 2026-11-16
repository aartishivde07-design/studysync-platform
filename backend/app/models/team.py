from datetime import datetime
from app.extensions import db

class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, unique=True)
    name = db.Column(db.String(150), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    members = db.relationship('TeamMember', backref='team', cascade='all, delete-orphan', lazy='joined')

    def to_dict(self):
        project_data = None
        if self.project:
            project_data = {
                'id': self.project.id,
                'title': self.project.title,
                'domain': self.project.domain,
                'status': self.project.status,
                'creator_id': self.project.creator_id,
                'team_size': self.project.team_size
            }

        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'project': project_data,
            'members_count': len(self.members),
            'members': [m.to_dict() for m in self.members],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class TeamMember(db.Model):
    __tablename__ = 'team_members'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.String(80), default='Member')  # 'Leader', 'Frontend Developer', 'Backend Developer', etc.
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('team_id', 'user_id', name='uq_team_user'),
    )

    def to_dict(self):
        user_info = None
        if self.user:
            user_info = {
                'id': self.user.id,
                'full_name': self.user.full_name,
                'email': self.user.email,
                'department': self.user.department,
                'academic_year': self.user.academic_year,
                'avatar_url': self.user.profile.avatar_url if self.user.profile else '',
                'skills': [s.to_dict() for s in self.user.user_skills] if self.user.user_skills else []
            }

        return {
            'id': self.id,
            'team_id': self.team_id,
            'user_id': self.user_id,
            'role': self.role,
            'user': user_info,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None
        }
