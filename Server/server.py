from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import asyncio
from source import TigoGroq

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medical_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)

# --------------------
# Models
# --------------------
class User(db.Model):
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(120), nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role          = db.Column(db.String(20), nullable=False)
    specialty     = db.Column(db.String(120), nullable=True)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Appointment(db.Model):
    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_name  = db.Column(db.String(120), nullable=False)
    patient_name = db.Column(db.String(100), nullable=False)
    date         = db.Column(db.String(10), nullable=False)   # YYYY-MM-DD
    time         = db.Column(db.String(5), nullable=False)    # HH:MM
    status       = db.Column(db.String(20), default='scheduled')
    created_at   = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class ChatMessage(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id  = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # ← new
    message    = db.Column(db.Text, nullable=False)
    response   = db.Column(db.Text, nullable=False)
    timestamp  = db.Column(db.DateTime, default=datetime.datetime.utcnow)

@app.before_request
def create_tables():
    db.create_all()

# --------------------
# Authentication
# --------------------
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    user = User(
        name          = data['name'],
        email         = data['email'],
        password_hash = generate_password_hash(data['password']),
        role          = data['role'],
        specialty     = data.get('specialty')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'role': user.role,
        'specialty': user.specialty
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'role': user.role,
        'specialty': user.specialty
    }), 200

# --------------------
# Doctors List
# --------------------
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    docs = User.query.filter_by(role='doctor').all()
    return jsonify([{
        'id': d.id,
        'name': d.name,
        'specialty': d.specialty,
        'email': d.email
    } for d in docs]), 200

# --------------------
# Appointments (create + list by userId or doctorId)
# --------------------
@app.route('/api/appointments', methods=['GET', 'POST'])
def appointments():
    if request.method == 'POST':
        data = request.get_json(force=True)
        app.logger.debug(f"Booking payload: {data!r}")
        try:
            appt = Appointment(
                user_id      = data['userId'],
                doctor_id    = data['doctorId'],
                doctor_name  = data['doctorName'],
                patient_name = data['patientName'],
                date         = data['date'],
                time         = data['time'],
                status       = data.get('status', 'scheduled'),
            )
            db.session.add(appt)
            db.session.commit()
            return jsonify({'id': appt.id}), 201
        except Exception as e:
            app.logger.error("Error creating appointment", exc_info=True)
            return jsonify({'error': str(e)}), 500

    # GET by patient or doctor
    user_id   = request.args.get('userId')
    doctor_id = request.args.get('doctorId')
    if not user_id and not doctor_id:
        return jsonify({'error': 'Missing userId or doctorId'}), 400

    query = Appointment.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    if doctor_id:
        query = query.filter_by(doctor_id=doctor_id)

    appts = query.order_by(Appointment.created_at.desc()).all()
    return jsonify([{
        'id': a.id,
        'userId': a.user_id,
        'doctorId': a.doctor_id,
        'doctorName': a.doctor_name,
        'patientName': a.patient_name,
        'date': a.date,
        'time': a.time,
        'status': a.status,
        'createdAt': a.created_at.isoformat()
    } for a in appts]), 200

@app.route('/api/appointments/delete/<int:appt_id>', methods=['DELETE'])
def delete_appointment(appt_id):
    appt = Appointment.query.get_or_404(appt_id)
    db.session.delete(appt)
    db.session.commit()
    return '', 204

@app.route('/api/appointments/update/<int:appointment_id>', methods=['PUT'])
def update_appointment_status(appointment_id):
    data = request.json
    appt = Appointment.query.get(appointment_id)
    if not appt:
        return jsonify({'error': 'Appointment not found'}), 404
    appt.status = data.get('status', appt.status)
    db.session.commit()
    return jsonify({'message': 'Appointment status updated'}), 200

# --------------------
# Chat (send + history by userId or doctorId)
# --------------------
@app.route('/api/chat', methods=['POST'])
def chat():
    data      = request.json
    user_msg  = data.get('message')
    user_id   = data.get('userId')
    doctor_id = data.get('doctorId')  # now optional

    if not user_msg or not user_id:
        return jsonify({'error': 'Missing userId or message'}), 400

    try:
        client   = TigoGroq()
        bot_resp = asyncio.run(client.get_response_from_ai(user_msg))
    except Exception as e:
        return jsonify({'error': 'AI service error', 'details': str(e)}), 502

    chat_entry = ChatMessage(
        user_id   = user_id,
        doctor_id = doctor_id,
        message   = user_msg,
        response  = bot_resp
    )
    db.session.add(chat_entry)
    db.session.commit()

    return jsonify({
        'response':  bot_resp,
        'timestamp': chat_entry.timestamp.isoformat()
    }), 201

@app.route('/api/chat', methods=['GET'])
def get_chat_history():
    user_id   = request.args.get('userId')
    doctor_id = request.args.get('doctorId')

    if not user_id and not doctor_id:
        return jsonify({'error': 'Missing userId or doctorId'}), 400

    query = ChatMessage.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    if doctor_id:
        query = query.filter_by(doctor_id=doctor_id)

    chats = query.order_by(ChatMessage.timestamp.desc()).all()
    history = [{
        'id':        c.id,
        'userId':    c.user_id,
        'doctorId':  c.doctor_id,
        'message':   c.message,
        'response':  c.response,
        'timestamp': c.timestamp.isoformat()
    } for c in chats]

    return jsonify({'history': history}), 200

if __name__ == '__main__':
    app.run(debug=True)
