import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';

interface MyAppointmentsProps {
  onBack: () => void;
}

const MyAppointments: React.FC<MyAppointmentsProps> = ({ onBack }) => {
  const { state } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Fetch this user's appointments via the path-based GET
  useEffect(() => {
    if (!state.user?.id) return;
    fetch(`http://localhost:5000/api/appointments?userId=${state.user.id}`)
      .then(res => res.json())
      .then(setAppointments)
      .catch(err => console.error('Error fetching appointments:', err));
  }, [state.user?.id]);

  // Delete via new delete path
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/delete/${appointmentId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setAppointments(prev =>
          prev.map(a =>
            a.id === appointmentId ? { ...a, status: 'cancelled' } : a
          )
        );
      }
    } catch (err) {
      console.error('Failed to cancel appointment', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-2">Manage your scheduled consultations</p>
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-6">
            {appointments.map(appointment => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md"
              >
                <div className="flex justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {appointment.doctorName}
                      </h3>
                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            Booked on{' '}
                            {new Date(appointment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(appointment.status)}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </span>
                    </div>

                    {appointment.status === 'scheduled' && (
                      <button
                        onClick={() =>
                          handleCancelAppointment(appointment.id)
                        }
                        className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm font-medium">Cancel</span>
                      </button>
                    )}
                  </div>
                </div>

                {appointment.status === 'scheduled' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>Reminder:</strong> Please arrive 15 minutes
                      early. To reschedule, contact us 24+ hours in advance.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Appointments Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't booked any appointments yet.
            </p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-lg"
            >
              Book Your First Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
