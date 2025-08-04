// src/components/DoctorDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MessageCircle,
  Clock,
  User,
  Users,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Appointment, ChatMessage } from '../../types';

type ActiveView = 'dashboard' | 'appointments' | 'messages' | 'availability';

const DoctorDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { state, dispatch } = useApp();

  const doctorId = state.user?.id;
  const doctorName = state.user?.name || '';

  // 1️⃣ Fetch appointments for this doctor
  useEffect(() => {
    if (!doctorId) return;
    fetch(`https://emmanueltigo.pythonanywhere.com/api/appointments?doctorId=${doctorId}`)
      .then(r => r.json())
      .then((data: Appointment[]) => setAppointments(data))
      .catch(console.error);
  }, [doctorId]);

  // 2️⃣ Fetch chat messages (all chats for this doctor)
  useEffect(() => {
    if (!doctorId) return;
    fetch(`https://emmanueltigo.pythonanywhere.com/api/chat?doctorId=${doctorId}`)
      .then(r => r.json())
      .then((json: { history: ChatMessage[] }) => setMessages(json.history))
      .catch(() => {
        // If your backend doesn't support doctorId filter, you can fetch all and filter:
        // fetch(`http://localhost:5000/api/chat?userId=${doctorId}`)
        //   .then(r => r.json()).then(json => {
        //     const all = json.history as ChatMessage[];
        //     setMessages(all.filter(m => m.doctorId === doctorId));
        //   });
        console.warn('Could not fetch doctor messages');
      });
  }, [doctorId]);

  // 3️⃣ Handle status updates via API
  const handleUpdateAppointmentStatus = async (appointmentId: string, status: 'completed' | 'cancelled') => {
    try {
      const res = await fetch(`https://emmanueltigo.pythonanywhere.com/api/appointments/update/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status } : app
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Derived lists
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(app => app.date === today && app.status === 'scheduled');
  const upcomingAppointments = appointments
    .filter(app => new Date(`${app.date} ${app.time}`) > new Date() && app.status === 'scheduled')
    .slice(0, 5);

  // Status icons/colors
  const getStatusIcon = (status: string) => {
    if (status === 'scheduled') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-blue-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };
  const getStatusColor = (status: string) => {
    if (status === 'scheduled') return 'bg-green-100 text-green-800';
    if (status === 'completed') return 'bg-blue-100 text-blue-800';
    return 'bg-red-100 text-red-800';
  };

  // Render per view
  const renderContent = () => {
    switch (activeView) {
      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Appointments</h2>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map(app => (
                    <div key={app.id} className="border rounded-lg p-4 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{app.patientName}</h3>
                            <p className="text-gray-600">{app.date} at {app.time}</p>
                            <p className="text-sm text-gray-500">Booked on {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(app.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          {app.status === 'scheduled' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateAppointmentStatus(app.id, 'completed')}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Complete</span>
                              </button>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(app.id, 'cancelled')}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg"
                              >
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm">Cancel</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No appointments scheduled yet</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6">
            {/* similar structure to your previous messages UI, but using `messages` state */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Messages</h2>
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-900">{msg.userId}</span>
                            <span className="text-sm text-gray-500">{new Date(msg.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-gray-800">{msg.message}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-blue-800">{msg.response}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No messages from patients yet</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'availability':
        return (
          <div className="space-y-6">
            {/* Availability stays the same, using state.user.availability if available */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Availability</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {state.user?.availability?.map(time => (
                  <div key={time} className="p-4 border rounded-lg text-center">
                    <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <span className="font-medium text-gray-900">{time}</span>
                  </div>
                )) || <p>No availability set</p>}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            {/* Dashboard summary, using derived counts */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
              <div className="flex items-center space-x-4">
                <User className="w-8 h-8 text-white bg-white bg-opacity-20 rounded-full p-2" />
                <div>
                  <h1 className="text-3xl font-bold">Welcome, {state.user?.name}!</h1>
                  <p className="text-green-100 mt-2">{state.user?.specialty} • Manage your clinic</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard icon={<Calendar className="w-6 h-6 text-blue-600" />} label="Today's" count={todayAppointments.length} />
              <StatsCard icon={<Users className="w-6 h-6 text-green-600" />} label="Upcoming" count={upcomingAppointments.length} />
              <StatsCard icon={<MessageCircle className="w-6 h-6 text-purple-600" />} label="Messages" count={messages.length} />
              <StatsCard icon={<Activity className="w-6 h-6 text-teal-600" />} label="Slots" count={state.user?.availability?.length || 0} />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ActionCard onClick={() => setActiveView('appointments')} icon={<Calendar className="w-6 h-6 text-blue-600" />} title="Manage Appointments" subtitle="View and update patient appointments" />
              <ActionCard onClick={() => setActiveView('messages')} icon={<MessageCircle className="w-6 h-6 text-purple-600" />} title="Patient Messages" subtitle="Review conversations" />
              <ActionCard onClick={() => setActiveView('availability')} icon={<Clock className="w-6 h-6 text-teal-600" />} title="My Availability" subtitle="View your slots" />
            </div>

            {/* Today's appointments preview */}
            <PreviewToday appointments={todayAppointments} onViewAll={() => setActiveView('appointments')} />
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {activeView !== 'dashboard' && (
        <button onClick={() => setActiveView('dashboard')} className="mb-6 text-gray-600 hover:text-gray-900">
          ← Back to Dashboard
        </button>
      )}
      {renderContent()}
    </div>
  );
};

// Helper components for brevity
const StatsCard: React.FC<{ icon: React.ReactNode; label: string; count: number }> = ({ icon, label, count }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center space-x-4">
    <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
    <div>
      <h3 className="text-2xl font-bold text-gray-900">{count}</h3>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  </div>
);

const ActionCard: React.FC<{ onClick(): void; icon: React.ReactNode; title: string; subtitle: string }> = ({ onClick, icon, title, subtitle }) => (
  <button onClick={onClick} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-left hover:shadow-md transition">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  </button>
);

const PreviewToday: React.FC<{ appointments: Appointment[]; onViewAll(): void }> = ({ appointments, onViewAll }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
      <button onClick={onViewAll} className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
    </div>
    {appointments.length > 0 ? (
      <div className="space-y-4">
        {appointments.map(app => (
          <div key={app.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{app.patientName}</h3>
              <p className="text-sm text-gray-600">Scheduled for {app.time}</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Today</span>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No appointments for today</p>
      </div>
    )}
  </div>
);

export default DoctorDashboard;
