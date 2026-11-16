from datetime import datetime
from app.extensions import db

class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    domain = db.Column(db.String(100), nullable=False)  # e.g., 'Web Development', 'AI/Machine Learning', 'Mobile Apps', 'Cybersecurity', 'Blockchain'
    team_size = db.Column(db.Integer, default=4, nullable=False)
    deadline = db.Column(db.String(50), nullable=True)  # e.g., '2026-12-15' or 'End of Semester'
    availability_requirement = db.Column(db.String(100), default='10-15 hrs/week')
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(30), default='recruiting')  # 'recruiting', 'in_progress', 'completed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    required_skills = db.relationship('ProjectRequiredSkill', backref='project', cascade='all, delete-orphan', lazy='joined')
    roles = db.relationship('ProjectRole', backref='project', cascade='all, delete-orphan', lazy='joined')
    team = db.relationship('Team', backref='project', uselist=False, cascade='all, delete-orphan')
    join_requests = db.relationship('JoinRequest', backref='project', cascade='all, delete-orphan')

    def to_dict(self, current_user_id=None):
        creator_info = None
        if self.creator:
            creator_info = {
                'id': self.creator.id,
                'full_name': self.creator.full_name,
                'email': self.creator.email,
                'department': self.creator.department,
                'academic_year': self.creator.academic_year,
                'avatar_url': self.creator.profile.avatar_url if self.creator.profile else ''
            }

        skills_list = []
        for prs in self.required_skills:
            skills_list.append({
                'id': prs.id,
                'skill_id': prs.skill_id,
                'skill_name': prs.skill.name if prs.skill else '',
                'proficiency_level': prs.proficiency_level,
                'is_required': prs.is_required
            })

        roles_list = []
        for r in self.roles:
            roles_list.append({
                'id': r.id,
                'role_name': r.role_name,
                'open_spots': r.open_spots
            })

        team_info = None
        members_count = 0
        is_member = False
        user_join_status = None

        if self.team:
            members_count = len(self.team.members)
            team_info = {
                'id': self.team.id,
                'name': self.team.name,
                'members_count': members_count,
                'members': [m.to_dict() for m in self.team.members]
            }
            if current_user_id:
                for m in self.team.members:
                    if m.user_id == current_user_id:
                        is_member = True
                        break

        if current_user_id and not is_member and self.creator_id != current_user_id:
            # Check if user sent a join request
            for req in self.join_requests:
                if req.applicant_id == current_user_id:
                    user_join_status = req.status
                    break

        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'domain': self.domain,
            'team_size': self.team_size,
            'deadline': self.deadline,
            'availability_requirement': self.availability_requirement,
            'creator_id': self.creator_id,
            'creator': creator_info,
            'status': self.status,
            'required_skills': skills_list,
            'roles': roles_list,
            'team': team_info,
            'members_count': members_count,
            'is_full': members_count >= self.team_size,
            'is_creator': current_user_id == self.creator_id if current_user_id else False,
            'is_member': is_member or (current_user_id == self.creator_id if current_user_id else False),
            'user_join_status': user_join_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class ProjectRequiredSkill(db.Model):
    __tablename__ = 'project_required_skills'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)
    proficiency_level = db.Column(db.String(20), default='Intermediate')
    is_required = db.Column(db.Boolean, default=True)

    __table_args__ = (
        db.UniqueConstraint('project_id', 'skill_id', name='uq_project_skill'),
    )


class ProjectRole(db.Model):
    __tablename__ = 'project_roles'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    role_name = db.Column(db.String(80), nullable=False)
    open_spots = db.Column(db.Integer, default=1)
