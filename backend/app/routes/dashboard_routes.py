from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.project import Project
from app.models.team import TeamMember
from app.models.request import JoinRequest
from app.models.notification import Notification
from app.services.matching_service import MatchingService

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    profile = user.profile

    # Calculate Profile Completion Percentage
    completion_score = 0
    missing_items = []
    
    # 1. Bio (20%)
    if profile and profile.bio and len(profile.bio.strip()) > 15:
        completion_score += 20
    else:
        missing_items.append("Add a personal bio")

    # 2. Skills >= 2 (25%)
    if user.user_skills and len(user.user_skills) >= 2:
        completion_score += 25
    elif user.user_skills and len(user.user_skills) >= 1:
        completion_score += 15
        missing_items.append("Add more skills")
    else:
        missing_items.append("Add your technical skills")

    # 3. Interests >= 1 (15%)
    if user.user_interests and len(user.user_interests) >= 1:
        completion_score += 15
    else:
        missing_items.append("Select your academic interests")

    # 4. Learning Goals (15%)
    if profile and profile.learning_goals and len(profile.learning_goals.strip()) > 5:
        completion_score += 15
    else:
        missing_items.append("Define your learning goals")

    # 5. Availability (15%)
    if profile and profile.availability:
        completion_score += 15
    else:
        missing_items.append("Specify your weekly availability")

    # 6. College / Department (10%)
    if user.department and user.academic_year:
        completion_score += 10

    completion_score = min(completion_score, 100)

    # Available Projects Count (projects currently recruiting)
    available_projects_count = Project.query.filter_by(status='recruiting').count()

    # Pending Requests Count (both sent and received)
    pending_sent_count = JoinRequest.query.filter_by(applicant_id=user_id, status='pending').count()
    user_projects = Project.query.filter_by(creator_id=user_id).all()
    user_project_ids = [p.id for p in user_projects]
    pending_received_count = 0
    if user_project_ids:
        pending_received_count = JoinRequest.query.filter(
            JoinRequest.project_id.in_(user_project_ids),
            JoinRequest.status == 'pending'
        ).count()
    
    total_pending_requests = pending_sent_count + pending_received_count

    # Joined Teams Count
    joined_teams_count = TeamMember.query.filter_by(user_id=user_id).count()

    # Top Recommended Teammates using the matching algorithm
    recommended_teammates = MatchingService.match_students_for_user(user, limit=4)

    # Recommended Projects (active projects matching student's skills or domain)
    user_skill_names = {us.skill.name.lower() for us in user.user_skills if us.skill}
    recruiting_projects = Project.query.filter(Project.creator_id != user_id, Project.status == 'recruiting').order_by(Project.created_at.desc()).limit(10).all()
    
    recommended_projects = []
    for p in recruiting_projects:
        p_dict = p.to_dict(current_user_id=user_id)
        # Check skill overlap
        overlap = [s['skill_name'] for s in p_dict['required_skills'] if s['skill_name'].lower() in user_skill_names]
        p_dict['matching_skills'] = overlap
        recommended_projects.append(p_dict)

    # Sort projects with most matching skills first
    recommended_projects.sort(key=lambda p: len(p.get('matching_skills', [])), reverse=True)
    recommended_projects = recommended_projects[:4]

    # Recent Notifications / Activities
    recent_notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(5).all()

    return jsonify({
        'welcome_name': user.full_name,
        'profile_completion': completion_score,
        'missing_profile_items': missing_items,
        'available_projects_count': available_projects_count,
        'pending_requests_count': total_pending_requests,
        'pending_sent_count': pending_sent_count,
        'pending_received_count': pending_received_count,
        'joined_teams_count': joined_teams_count,
        'recommended_teammates': recommended_teammates,
        'recommended_projects': recommended_projects,
        'recent_activities': [n.to_dict() for n in recent_notifications]
    }), 200
