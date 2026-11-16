from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.extensions import db
from app.models.user import User, StudentProfile
from app.utils.validators import validate_registration_payload

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    is_valid, error_msg = validate_registration_payload(data)
    if not is_valid:
        return jsonify({'error': error_msg}), 400

    email = data['email'].strip().lower()
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email address already exists'}), 409

    try:
        new_user = User(
            email=email,
            full_name=data['full_name'].strip(),
            department=data['department'].strip(),
            academic_year=data['academic_year'].strip()
        )
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.flush()

        # Create linked StudentProfile
        profile = StudentProfile(
            user_id=new_user.id,
            department=new_user.department,
            academic_year=new_user.academic_year,
            college_name=data.get('college_name', '').strip() or 'University Campus',
            college_email=data.get('college_email', '').strip(),
            bio=data.get('bio', '').strip() or 'Excited to collaborate on meaningful projects and build strong teams.',
            availability=data.get('availability', '10-15 hrs/week')
        )
        db.session.add(profile)
        db.session.commit()

        # Generate JWT token
        token = create_access_token(identity=str(new_user.id))

        return jsonify({
            'message': 'Account registered successfully',
            'token': token,
            'user': new_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to register account: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email address or password'}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # In stateless JWT, client deletes token. Route provided for API contract compliance.
    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200
