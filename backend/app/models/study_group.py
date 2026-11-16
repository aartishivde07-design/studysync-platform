from datetime import datetime
from app.extensions import db

class StudyGroup(db.Model):
    __tablename__ = 'study_groups'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False, index=True)
    subject = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    max_members = db.Column(db.Integer, default=6)
    meeting_schedule = db.Column(db.String(150), default='Tuesdays & Thursdays at 6 PM')
    preferred_learning_method = db.Column(db.String(100), default='Hands-on Problem Solving')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    members = db.relationship('StudyGroupMember', backref='study_group', cascade='all, delete-orphan', lazy='joined')
    creator = db.relationship('User', foreign_keys=[creator_id])

    def to_dict(self, current_user_id=None):
        creator_info = None
        if self.creator:
            creator_info = {
                'id': self.creator.id,
                'full_name': self.creator.full_name,
                'email': self.creator.email,
                'department': self.creator.department,
                'avatar_url': self.creator.profile.avatar_url if self.creator.profile else ''
            }

        members_list = [m.to_dict() for m in self.members]
        is_member = False
        if current_user_id:
            for m in self.members:
                if m.user_id == current_user_id:
                    is_member = True
                    break

        return {
            'id': self.id,
            'name': self.name,
            'subject': self.subject,
            'description': self.description,
            'creator_id': self.creator_id,
            'creator': creator_info,
            'max_members': self.max_members,
            'current_members_count': len(self.members),
            'is_full': len(self.members) >= self.max_members,
            'meeting_schedule': self.meeting_schedule,
            'preferred_learning_method': self.preferred_learning_method,
            'members': members_list,
            'is_creator': current_user_id == self.creator_id if current_user_id else False,
            'is_member': is_member or (current_user_id == self.creator_id if current_user_id else False),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class StudyGroupMember(db.Model):
    __tablename__ = 'study_group_members'

    id = db.Column(db.Integer, primary_key=True)
    study_group_id = db.Column(db.Integer, db.ForeignKey('study_groups.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('study_group_id', 'user_id', name='uq_group_user'),
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
                'avatar_url': self.user.profile.avatar_url if self.user.profile else ''
            }

        return {
            'id': self.id,
            'study_group_id': self.study_group_id,
            'user_id': self.user_id,
            'user': user_info,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None
        }
