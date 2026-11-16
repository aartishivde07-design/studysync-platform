from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User, StudentProfile

profile_bp = Blueprint('profiles', __name__, url_prefix='/api/profiles')

@profile_bp.route('', methods=['GET'])
def get_profiles():
    search = request.args.get('search', '').strip().lower()
    department = request.args.get('department', '').strip()
    academic_year = request.args.get('academic_year', '').strip()
    skill_filter = request.args.get('skill', '').strip().lower()

    query = User.query

    if department:
        query = query.filter(User.department.ilike(f'%{department}%'))
    if academic_year:
        query = query.filter(User.academic_year == academic_year)
    if search:
        query = query.filter(
            (User.full_name.ilike(f'%{search}%')) |
            (User.department.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%'))
        )

    users = query.all()

    # Filter by skill if requested
    results = []
    for u in users:
        u_data = u.to_dict()
        if skill_filter:
            has_skill = any(skill_filter in s['skill_name'].lower() for s in u_data['skills'])
            if not has_skill:
                continue
        results.append(u_data)

    return jsonify({'profiles': results, 'count': len(results)}), 200


@profile_bp.route('/<int:profile_id>', methods=['GET'])
def get_profile_by_id(profile_id):
    user = db.session.get(User, profile_id)
    if not user:
        # Also check if profile_id matches student_profiles.id
        profile = db.session.get(StudentProfile, profile_id)
        if profile and profile.user:
            user = profile.user
        else:
            return jsonify({'error': 'Student profile not found'}), 404

    return jsonify({'profile': user.to_dict()}), 200


@profile_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_my_profile():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}

    # Update basic user fields
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'department' in data and data['department'].strip():
        user.department = data['department'].strip()
    if 'academic_year' in data and data['academic_year'].strip():
        user.academic_year = data['academic_year'].strip()

    # Ensure profile exists
    profile = user.profile
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.session.add(profile)

    # Update profile fields
    if 'college_name' in data:
        profile.college_name = data['college_name'].strip()
    if 'college_email' in data:
        profile.college_email = data['college_email'].strip()
    if 'bio' in data:
        profile.bio = data['bio'].strip()
    if 'avatar_url' in data:
        profile.avatar_url = data['avatar_url'].strip()
    if 'learning_goals' in data:
        profile.learning_goals = data['learning_goals'].strip()
    if 'availability' in data:
        profile.availability = data['availability'].strip()
    if 'preferred_domains' in data:
        domains = data['preferred_domains']
        if isinstance(domains, list):
            profile.preferred_domains = ', '.join([d.strip() for d in domains if d.strip()])
        else:
            profile.preferred_domains = str(domains).strip()

    profile.department = user.department
    profile.academic_year = user.academic_year

    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500
