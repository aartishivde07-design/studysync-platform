from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.team import Team, TeamMember
from app.models.project import Project

team_bp = Blueprint('teams', __name__, url_prefix='/api/teams')

@team_bp.route('', methods=['GET'])
@jwt_required()
def get_user_teams():
    """Retrieve all teams where the authenticated user is either the creator or a member."""
    user_id = int(get_jwt_identity())
    
    # Get teams from memberships
    memberships = TeamMember.query.filter_by(user_id=user_id).all()
    team_ids = [m.team_id for m in memberships]

    # Also include teams for projects created by this user
    created_projects = Project.query.filter_by(creator_id=user_id).all()
    for cp in created_projects:
        if cp.team and cp.team.id not in team_ids:
            team_ids.append(cp.team.id)

    if not team_ids:
        return jsonify({'teams': [], 'count': 0}), 200

    teams = Team.query.filter(Team.id.in_(team_ids)).all()
    return jsonify({
        'teams': [t.to_dict() for t in teams],
        'count': len(teams)
    }), 200


@team_bp.route('/<int:team_id>', methods=['GET'])
@jwt_required()
def get_team_by_id(team_id):
    """Retrieve specific team details, roster, roles, and project info."""
    user_id = int(get_jwt_identity())
    team = db.session.get(Team, team_id)
    if not team:
        return jsonify({'error': 'Team not found'}), 404

    # Security check: User must be member or project creator or can view public team info
    is_member = any(m.user_id == user_id for m in team.members)
    is_creator = team.project and team.project.creator_id == user_id

    team_data = team.to_dict()
    team_data['is_authorized_manager'] = is_creator
    team_data['is_user_member'] = is_member or is_creator

    return jsonify({'team': team_data}), 200
