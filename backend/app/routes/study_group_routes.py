from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.extensions import db
from app.models.study_group import StudyGroup, StudyGroupMember

study_group_bp = Blueprint('study_groups', __name__, url_prefix='/api/study-groups')

def get_optional_user_id():
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except Exception:
        return None

@study_group_bp.route('', methods=['GET'])
def get_study_groups():
    search = request.args.get('search', '').strip().lower()
    subject = request.args.get('subject', '').strip()
    current_user_id = get_optional_user_id()

    query = StudyGroup.query

    if subject:
        query = query.filter(StudyGroup.subject.ilike(f'%{subject}%'))
    if search:
        query = query.filter(
            (StudyGroup.name.ilike(f'%{search}%')) |
            (StudyGroup.subject.ilike(f'%{search}%')) |
            (StudyGroup.description.ilike(f'%{search}%'))
        )

    groups = query.order_by(StudyGroup.created_at.desc()).all()
    results = [g.to_dict(current_user_id=current_user_id) for g in groups]

    return jsonify({'study_groups': results, 'count': len(results)}), 200


@study_group_bp.route('', methods=['POST'])
@jwt_required()
def create_study_group():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    name = data.get('name', '').strip()
    subject = data.get('subject', '').strip()
    description = data.get('description', '').strip()
    max_members = data.get('max_members', 6)
    meeting_schedule = data.get('meeting_schedule', '').strip() or 'Flexible / To be decided'
    preferred_learning_method = data.get('preferred_learning_method', '').strip() or 'Discussion & Practice'

    if not name or not subject or not description:
        return jsonify({'error': 'Name, subject, and description are required fields'}), 400

    try:
        try:
            max_members = int(max_members)
            if max_members < 2:
                max_members = 2
        except (ValueError, TypeError):
            max_members = 6

        new_group = StudyGroup(
            name=name,
            subject=subject,
            description=description,
            creator_id=user_id,
            max_members=max_members,
            meeting_schedule=meeting_schedule,
            preferred_learning_method=preferred_learning_method
        )
        db.session.add(new_group)
        db.session.flush()

        # Add creator as first member
        creator_member = StudyGroupMember(
            study_group_id=new_group.id,
            user_id=user_id
        )
        db.session.add(creator_member)
        db.session.commit()

        return jsonify({
            'message': 'Study group created successfully',
            'study_group': new_group.to_dict(current_user_id=user_id)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create study group: {str(e)}'}), 500


@study_group_bp.route('/<int:group_id>/join', methods=['POST'])
@jwt_required()
def join_study_group(group_id):
    user_id = int(get_jwt_identity())
    group = db.session.get(StudyGroup, group_id)
    if not group:
        return jsonify({'error': 'Study group not found'}), 404

    # Check if already joined
    existing_member = StudyGroupMember.query.filter_by(study_group_id=group.id, user_id=user_id).first()
    if existing_member:
        return jsonify({'error': 'You are already a member of this study group'}), 400

    # Check if group is full
    if len(group.members) >= group.max_members:
        return jsonify({'error': 'Cannot join: Study group is already full'}), 400

    try:
        member = StudyGroupMember(
            study_group_id=group.id,
            user_id=user_id
        )
        db.session.add(member)
        db.session.commit()

        return jsonify({
            'message': 'Joined study group successfully',
            'study_group': group.to_dict(current_user_id=user_id)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to join study group: {str(e)}'}), 500


@study_group_bp.route('/<int:group_id>/leave', methods=['POST'])
@jwt_required()
def leave_study_group(group_id):
    user_id = int(get_jwt_identity())
    member = StudyGroupMember.query.filter_by(study_group_id=group_id, user_id=user_id).first()
    if not member:
        return jsonify({'error': 'You are not a member of this study group'}), 404

    try:
        db.session.delete(member)
        db.session.commit()
        return jsonify({'message': 'Left study group successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to leave study group: {str(e)}'}), 500
