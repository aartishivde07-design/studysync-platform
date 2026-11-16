from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.project import Project
from app.models.request import JoinRequest
from app.models.team import Team, TeamMember
from app.models.user import User
from app.utils.notifications import send_notification

request_bp = Blueprint('requests', __name__, url_prefix='/api/requests')

@request_bp.route('', methods=['POST'])
@jwt_required()
def send_join_request():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    project_id = data.get('project_id')
    message = data.get('message', '').strip()
    role_applied = data.get('role_applied', 'Contributor').strip()

    if not project_id:
        return jsonify({'error': 'project_id is required'}), 400

    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # 1. Prevent applying to own project
    if project.creator_id == user_id:
        return jsonify({'error': 'You cannot send a join request to your own project'}), 400

    # 2. Check if team is already full
    current_team = project.team
    if current_team and len(current_team.members) >= project.team_size:
        return jsonify({'error': 'Cannot apply: This project team has reached its maximum size'}), 400

    # 3. Check if already a member
    if current_team:
        for m in current_team.members:
            if m.user_id == user_id:
                return jsonify({'error': 'You are already a member of this project team'}), 400

    # 4. Check for existing pending request
    existing_req = JoinRequest.query.filter_by(project_id=project.id, applicant_id=user_id).first()
    if existing_req:
        if existing_req.status == 'pending':
            return jsonify({'error': 'You already have a pending request for this project'}), 409
        elif existing_req.status == 'accepted':
            return jsonify({'error': 'You are already accepted into this project'}), 409
        else:
            # Re-open if previously rejected or cancelled
            existing_req.status = 'pending'
            existing_req.message = message
            existing_req.role_applied = role_applied
            db.session.commit()

            # Notify creator
            applicant = User.query.get(user_id)
            send_notification(
                user_id=project.creator_id,
                notif_type='request_received',
                title='New Join Request Received',
                message=f"{applicant.full_name} has requested to join your project '{project.title}' as {role_applied}.",
                link=f"/requests"
            )
            return jsonify({
                'message': 'Join request submitted successfully',
                'request': existing_req.to_dict()
            }), 200

    new_request = JoinRequest(
        project_id=project.id,
        applicant_id=user_id,
        message=message,
        role_applied=role_applied,
        status='pending'
    )
    db.session.add(new_request)
    db.session.commit()

    # Notify project creator
    applicant = db.session.get(User, user_id)
    send_notification(
        user_id=project.creator_id,
        notif_type='request_received',
        title='New Join Request Received',
        message=f"{applicant.full_name} has requested to join your project '{project.title}' as {role_applied}.",
        link=f"/requests"
    )

    return jsonify({
        'message': 'Join request submitted successfully',
        'request': new_request.to_dict()
    }), 201


@request_bp.route('/sent', methods=['GET'])
@jwt_required()
def get_sent_requests():
    """Retrieve all requests sent by the current student."""
    user_id = int(get_jwt_identity())
    requests = JoinRequest.query.filter_by(applicant_id=user_id).order_by(JoinRequest.created_at.desc()).all()
    return jsonify({'requests': [r.to_dict() for r in requests]}), 200


@request_bp.route('/received', methods=['GET'])
@jwt_required()
def get_received_requests():
    """Retrieve all requests received for projects owned by the current student."""
    user_id = int(get_jwt_identity())
    user_projects = Project.query.filter_by(creator_id=user_id).all()
    project_ids = [p.id for p in user_projects]

    if not project_ids:
        return jsonify({'requests': []}), 200

    requests = JoinRequest.query.filter(JoinRequest.project_id.in_(project_ids)).order_by(JoinRequest.created_at.desc()).all()
    return jsonify({'requests': [r.to_dict() for r in requests]}), 200


@request_bp.route('/<int:request_id>/accept', methods=['PUT'])
@jwt_required()
def accept_request(request_id):
    user_id = int(get_jwt_identity())
    join_req = db.session.get(JoinRequest, request_id)
    if not join_req:
        return jsonify({'error': 'Request not found'}), 404

    project = join_req.project
    if not project or project.creator_id != user_id:
        return jsonify({'error': 'Unauthorized: Only project creator can accept requests'}), 403

    if join_req.status == 'accepted':
        return jsonify({'error': 'This request has already been accepted'}), 400

    team = project.team
    if not team:
        team = Team(project_id=project.id, name=f"Team {project.title}")
        db.session.add(team)
        db.session.flush()

    # Check team capacity
    if len(team.members) >= project.team_size:
        return jsonify({'error': f'Team is already full ({len(team.members)}/{project.team_size} members)'}), 400

    # Check if applicant is already a member
    for m in team.members:
        if m.user_id == join_req.applicant_id:
            join_req.status = 'accepted'
            db.session.commit()
            return jsonify({'message': 'Applicant is already in the team', 'request': join_req.to_dict()}), 200

    # Add as team member
    member = TeamMember(
        team_id=team.id,
        user_id=join_req.applicant_id,
        role=join_req.role_applied or 'Member'
    )
    db.session.add(member)
    join_req.status = 'accepted'

    # Check if team is now full
    if len(team.members) + 1 >= project.team_size:
        project.status = 'in_progress'

    db.session.commit()

    # Notify applicant
    send_notification(
        user_id=join_req.applicant_id,
        notif_type='request_accepted',
        title='Join Request Accepted! 🎉',
        message=f"Congratulations! You were accepted into project '{project.title}' as {join_req.role_applied}.",
        link=f"/projects/{project.id}"
    )

    return jsonify({
        'message': 'Request accepted and applicant added to team',
        'request': join_req.to_dict()
    }), 200


@request_bp.route('/<int:request_id>/reject', methods=['PUT'])
@jwt_required()
def reject_request(request_id):
    user_id = int(get_jwt_identity())
    join_req = db.session.get(JoinRequest, request_id)
    if not join_req:
        return jsonify({'error': 'Request not found'}), 404

    project = join_req.project
    if not project or project.creator_id != user_id:
        return jsonify({'error': 'Unauthorized: Only project creator can reject requests'}), 403

    join_req.status = 'rejected'
    db.session.commit()

    # Notify applicant
    send_notification(
        user_id=join_req.applicant_id,
        notif_type='request_rejected',
        title='Join Request Update',
        message=f"Your request to join project '{project.title}' was declined by the team creator.",
        link=f"/projects/{project.id}"
    )

    return jsonify({
        'message': 'Request rejected',
        'request': join_req.to_dict()
    }), 200


@request_bp.route('/<int:request_id>/cancel', methods=['PUT', 'DELETE'])
@jwt_required()
def cancel_request(request_id):
    user_id = int(get_jwt_identity())
    join_req = db.session.get(JoinRequest, request_id)
    if not join_req:
        return jsonify({'error': 'Request not found'}), 404

    if join_req.applicant_id != user_id:
        return jsonify({'error': 'Unauthorized: You can only cancel your own requests'}), 403

    if join_req.status == 'accepted':
        return jsonify({'error': 'Cannot cancel an already accepted request. Leave the team instead.'}), 400

    join_req.status = 'cancelled'
    db.session.commit()

    return jsonify({'message': 'Request cancelled successfully'}), 200
