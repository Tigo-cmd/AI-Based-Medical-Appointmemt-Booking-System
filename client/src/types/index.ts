// index.tsx

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  specialty?: string; // Only for doctors
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  patientName?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  doctorId?: string;
  message: string;
  response: string;
  timestamp: string;
  isFromDoctor?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availability: string[];
  email: string;
}