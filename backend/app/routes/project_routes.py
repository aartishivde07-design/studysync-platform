from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.extensions import db
from app.models.project import Project, ProjectRequiredSkill, ProjectRole
from app.models.skill import Skill
from app.models.team import Team, TeamMember

project_bp = Blueprint('projects', __name__, url_prefix='/api/projects')

def get_optional_user_id():
    """Extracts user id if valid JWT header present, else None."""
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except Exception:
        return None


@project_bp.route('', methods=['GET'])
def get_projects():
    search = request.args.get('search', '').strip().lower()
    domain = request.args.get('domain', '').strip()
    skill_filter = request.args.get('skill', '').strip().lower()
    status = request.args.get('status', '').strip()
    my_projects = request.args.get('mine', '').strip().lower() == 'true'

    current_user_id = get_optional_user_id()

    query = Project.query

    if my_projects and current_user_id:
        query = query.filter_by(creator_id=current_user_id)
    if domain:
        query = query.filter(Project.domain.ilike(f'%{domain}%'))
    if status:
        query = query.filter(Project.status == status)
    if search:
        query = query.filter(
            (Project.title.ilike(f'%{search}%')) |
            (Project.description.ilike(f'%{search}%')) |
            (Project.domain.ilike(f'%{search}%'))
        )

    projects = query.order_by(Project.created_at.desc()).all()

    results = []
    for p in projects:
        p_data = p.to_dict(current_user_id=current_user_id)
        if skill_filter:
            has_skill = any(skill_filter in s['skill_name'].lower() for s in p_data['required_skills'])
            if not has_skill:
                continue
        results.append(p_data)

    return jsonify({'projects': results, 'count': len(results)}), 200


@project_bp.route('/<int:project_id>', methods=['GET'])
def get_project_by_id(project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    current_user_id = get_optional_user_id()
    return jsonify({'project': project.to_dict(current_user_id=current_user_id)}), 200


@project_bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    domain = data.get('domain', '').strip()
    team_size = data.get('team_size', 4)
    deadline = data.get('deadline', '').strip()
    availability_requirement = data.get('availability_requirement', '10-15 hrs/week').strip()

    if not title or not description or not domain:
        return jsonify({'error': 'Title, description, and domain are required fields'}), 400

    try:
        try:
            team_size = int(team_size)
            if team_size < 2:
                team_size = 2
        except (ValueError, TypeError):
            team_size = 4

        new_project = Project(
            title=title,
            description=description,
            domain=domain,
            team_size=team_size,
            deadline=deadline,
            availability_requirement=availability_requirement,
            creator_id=user_id,
            status='recruiting'
        )
        db.session.add(new_project)
        db.session.flush()

        # Add Required Skills
        skills_input = data.get('required_skills', [])
        for item in skills_input:
            skill_name = item.get('skill_name', '').strip() if isinstance(item, dict) else str(item).strip()
            if not skill_name:
                continue
            proficiency = item.get('proficiency_level', 'Intermediate') if isinstance(item, dict) else 'Intermediate'
            
            skill = Skill.query.filter(Skill.name.ilike(skill_name)).first()
            if not skill:
                skill = Skill(name=skill_name, category=domain)
                db.session.add(skill)
                db.session.flush()

            req_skill = ProjectRequiredSkill(
                project_id=new_project.id,
                skill_id=skill.id,
                proficiency_level=proficiency,
                is_required=True
            )
            db.session.add(req_skill)

        # Add Project Roles
        roles_input = data.get('roles', [])
        if roles_input:
            for r in roles_input:
                role_name = r.get('role_name', '').strip() if isinstance(r, dict) else str(r).strip()
                if not role_name:
                    continue
                open_spots = r.get('open_spots', 1) if isinstance(r, dict) else 1
                proj_role = ProjectRole(
                    project_id=new_project.id,
                    role_name=role_name,
                    open_spots=open_spots
                )
                db.session.add(proj_role)
        else:
            # Add default roles
            db.session.add(ProjectRole(project_id=new_project.id, role_name='Core Contributor', open_spots=team_size-1))

        # Create linked Team and add Creator as Leader
        team = Team(
            project_id=new_project.id,
            name=f"Team {title}"
        )
        db.session.add(team)
        db.session.flush()

        leader_member = TeamMember(
            team_id=team.id,
            user_id=user_id,
            role='Team Leader'
        )
        db.session.add(leader_member)

        db.session.commit()

        return jsonify({
            'message': 'Project created successfully',
            'project': new_project.to_dict(current_user_id=user_id)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create project: {str(e)}'}), 500


@project_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    user_id = int(get_jwt_identity())
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    if project.creator_id != user_id:
        return jsonify({'error': 'Unauthorized: Only project creator can modify this project'}), 403

    data = request.get_json() or {}

    if 'title' in data and data['title'].strip():
        project.title = data['title'].strip()
    if 'description' in data and data['description'].strip():
        project.description = data['description'].strip()
    if 'domain' in data and data['domain'].strip():
        project.domain = data['domain'].strip()
    if 'deadline' in data:
        project.deadline = data['deadline'].strip()
    if 'availability_requirement' in data:
        project.availability_requirement = data['availability_requirement'].strip()
    if 'status' in data and data['status'] in ['recruiting', 'in_progress', 'completed']:
        project.status = data['status']
    if 'team_size' in data:
        try:
            ts = int(data['team_size'])
            if ts >= 2:
                project.team_size = ts
        except (ValueError, TypeError):
            pass

    # Update required skills if provided
    if 'required_skills' in data and isinstance(data['required_skills'], list):
        ProjectRequiredSkill.query.filter_by(project_id=project.id).delete()
        for item in data['required_skills']:
            skill_name = item.get('skill_name', '').strip() if isinstance(item, dict) else str(item).strip()
            if not skill_name:
                continue
            proficiency = item.get('proficiency_level', 'Intermediate') if isinstance(item, dict) else 'Intermediate'
            skill = Skill.query.filter(Skill.name.ilike(skill_name)).first()
            if not skill:
                skill = Skill(name=skill_name, category=project.domain)
                db.session.add(skill)
                db.session.flush()

            req_skill = ProjectRequiredSkill(
                project_id=project.id,
                skill_id=skill.id,
                proficiency_level=proficiency,
                is_required=True
            )
            db.session.add(req_skill)

    try:
        db.session.commit()
        return jsonify({
            'message': 'Project updated successfully',
            'project': project.to_dict(current_user_id=user_id)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update project: {str(e)}'}), 500


@project_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    user_id = int(get_jwt_identity())
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    if project.creator_id != user_id:
        return jsonify({'error': 'Unauthorized: Only project creator can delete this project'}), 403

    try:
        db.session.delete(project)
        db.session.commit()
        return jsonify({'message': 'Project deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete project: {str(e)}'}), 500
