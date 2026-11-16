from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.project import Project
from app.services.matching_service import MatchingService

matching_bp = Blueprint('matching', __name__, url_prefix='/api')

@matching_bp.route('/matches', methods=['GET'])
@jwt_required()
def get_user_matches():
    """
    Returns AI-powered peer matches for the authenticated student.
    Matches are computed in real time based on technical skills, interests,
    availability, and learning goals.
    """
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    limit = request.args.get('limit', 20, type=int)
    matches = MatchingService.match_students_for_user(user, limit=limit)

    return jsonify({
        'matches': matches,
        'count': len(matches),
        'algorithm_info': {
            'weights': MatchingService.get_weights(),
            'description': 'Multi-factor weighted recommendation algorithm assessing skill complement, interest alignment, schedule compatibility, and proficiency suitability.'
        }
    }), 200


@matching_bp.route('/projects/<int:project_id>/matches', methods=['GET'])
@jwt_required()
def get_project_matches(project_id):
    """
    Returns student recommendations tailored specifically to a project's
    required skills, proficiency demands, domain, and commitment hours.
    """
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    user_id = int(get_jwt_identity())
    # Note: Only creator or team members usually inspect candidate matches
    limit = request.args.get('limit', 20, type=int)
    matches = MatchingService.match_students_for_project(project, limit=limit)

    return jsonify({
        'project_id': project.id,
        'project_title': project.title,
        'matches': matches,
        'count': len(matches)
    }), 200
