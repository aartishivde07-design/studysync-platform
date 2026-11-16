from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.skill import Skill, UserSkill, Interest, UserInterest

skill_bp = Blueprint('skills', __name__, url_prefix='/api')

@skill_bp.route('/skills', methods=['GET'])
def get_all_skills():
    """Returns catalog of known skills."""
    skills = Skill.query.order_by(Skill.name).all()
    return jsonify({'skills': [s.to_dict() for s in skills]}), 200


@skill_bp.route('/skills', methods=['POST'])
@jwt_required()
def add_user_skill():
    """Add or update a skill on the authenticated student's profile."""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    skill_name = data.get('name', '').strip()
    proficiency = data.get('proficiency', 'Intermediate').strip()
    category = data.get('category', 'General').strip()

    if not skill_name:
        return jsonify({'error': 'Skill name is required'}), 400

    if proficiency not in ['Beginner', 'Intermediate', 'Advanced']:
        proficiency = 'Intermediate'

    try:
        # Find or create skill in global catalog
        skill = Skill.query.filter(Skill.name.ilike(skill_name)).first()
        if not skill:
            skill = Skill(name=skill_name, category=category)
            db.session.add(skill)
            db.session.flush()

        # Check if user already has this skill
        user_skill = UserSkill.query.filter_by(user_id=user_id, skill_id=skill.id).first()
        if user_skill:
            user_skill.proficiency = proficiency
        else:
            user_skill = UserSkill(user_id=user_id, skill_id=skill.id, proficiency=proficiency)
            db.session.add(user_skill)

        db.session.commit()
        return jsonify({
            'message': 'Skill saved successfully',
            'skill': user_skill.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add skill: {str(e)}'}), 500


@skill_bp.route('/skills/<int:skill_id>', methods=['DELETE'])
@jwt_required()
def remove_user_skill(skill_id):
    """Remove a skill from the authenticated student's profile."""
    user_id = int(get_jwt_identity())

    # Try matching by user_skill id or skill_id
    user_skill = UserSkill.query.filter(
        (UserSkill.user_id == user_id) &
        ((UserSkill.id == skill_id) | (UserSkill.skill_id == skill_id))
    ).first()

    if not user_skill:
        return jsonify({'error': 'Skill not found on your profile'}), 404

    try:
        db.session.delete(user_skill)
        db.session.commit()
        return jsonify({'message': 'Skill removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to remove skill: {str(e)}'}), 500


# ================= Interests endpoints =================

@skill_bp.route('/interests', methods=['GET'])
def get_all_interests():
    """Returns catalog of known academic/project interests."""
    interests = Interest.query.order_by(Interest.name).all()
    return jsonify({'interests': [i.to_dict() for i in interests]}), 200


@skill_bp.route('/interests', methods=['POST'])
@jwt_required()
def add_user_interest():
    """Add an interest to student's profile."""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    category = data.get('category', 'General').strip()

    if not name:
        return jsonify({'error': 'Interest name is required'}), 400

    try:
        interest = Interest.query.filter(Interest.name.ilike(name)).first()
        if not interest:
            interest = Interest(name=name, category=category)
            db.session.add(interest)
            db.session.flush()

        user_interest = UserInterest.query.filter_by(user_id=user_id, interest_id=interest.id).first()
        if not user_interest:
            user_interest = UserInterest(user_id=user_id, interest_id=interest.id)
            db.session.add(user_interest)

        db.session.commit()
        return jsonify({
            'message': 'Interest added successfully',
            'interest': user_interest.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add interest: {str(e)}'}), 500


@skill_bp.route('/interests/<int:interest_id>', methods=['DELETE'])
@jwt_required()
def remove_user_interest(interest_id):
    """Remove an interest from student's profile."""
    user_id = int(get_jwt_identity())
    user_interest = UserInterest.query.filter(
        (UserInterest.user_id == user_id) &
        ((UserInterest.id == interest_id) | (UserInterest.interest_id == interest_id))
    ).first()

    if not user_interest:
        return jsonify({'error': 'Interest not found on your profile'}), 404

    try:
        db.session.delete(user_interest)
        db.session.commit()
        return jsonify({'message': 'Interest removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to remove interest: {str(e)}'}), 500
