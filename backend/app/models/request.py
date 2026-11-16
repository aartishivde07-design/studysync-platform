from datetime import datetime
from app.extensions import db

class JoinRequest(db.Model):
    __tablename__ = 'join_requests'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    applicant_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    message = db.Column(db.Text, default='')
    role_applied = db.Column(db.String(80), default='Contributor')
    status = db.Column(db.String(20), default='pending')  # 'pending', 'accepted', 'rejected', 'cancelled'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('project_id', 'applicant_id', name='uq_project_applicant'),
    )

    def to_dict(self):
        applicant_data = None
        if self.applicant:
            applicant_data = {
                'id': self.applicant.id,
                'full_name': self.applicant.full_name,
                'email': self.applicant.email,
                'department': self.applicant.department,
                'academic_year': self.applicant.academic_year,
                'avatar_url': self.applicant.profile.avatar_url if self.applicant.profile else '',
                'skills': [s.to_dict() for s in self.applicant.user_skills] if self.applicant.user_skills else []
            }

        project_data = None
        if self.project:
            project_data = {
                'id': self.project.id,
                'title': self.project.title,
                'domain': self.project.domain,
                'creator_id': self.project.creator_id,
                'creator_name': self.project.creator.full_name if self.project.creator else ''
            }

        return {
            'id': self.id,
            'project_id': self.project_id,
            'project': project_data,
            'applicant_id': self.applicant_id,
            'applicant': applicant_data,
            'message': self.message,
            'role_applied': self.role_applied,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
