from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.notification import Notification

notification_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notification_bp.route('', methods=['GET'])
@jwt_required()
def get_user_notifications():
    user_id = int(get_jwt_identity())
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    unread_count = sum(1 for n in notifications if not n.is_read)

    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    }), 200


@notification_bp.route('/<int:notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_as_read(notif_id):
    user_id = int(get_jwt_identity())
    notification = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404

    notification.is_read = True
    db.session.commit()

    return jsonify({
        'message': 'Notification marked as read',
        'notification': notification.to_dict()
    }), 200


@notification_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_notifications_as_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()

    return jsonify({'message': 'All notifications marked as read'}), 200
