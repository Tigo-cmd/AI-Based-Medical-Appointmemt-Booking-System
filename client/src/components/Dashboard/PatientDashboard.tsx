import React, { useState } from 'react';
import { Calendar, MessageCircle, Clock, User, Plus, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import BookAppointment from '../Appointments/BookAppointment';
import Chatbot from '../Chatbot/Chatbot';
import MyAppointments from '../Appointments/MyAppointments';
import ChatHistory from '../Chatbot/ChatHistory';

type ActiveView = 'dashboard' | 'book' | 'appointments' | 'chat' | 'chat-history';

const PatientDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const { state } = useApp();

  const upcomingAppointments = state.appointments
    .filter(app => app.userId === state.user?.id && app.status === 'scheduled')
    .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
    .slice(0, 3);

  const renderContent = () => {
    switch (activeView) {
      case 'book':
        return <BookAppointment onBack={() => setActiveView('dashboard')} />;
      case 'appointments':
        return <MyAppointments onBack={() => setActiveView('dashboard')} />;
      case 'chat':
        return <Chatbot onBack={() => setActiveView('dashboard')} />;
      case 'chat-history':
        return <ChatHistory onBack={() => setActiveView('dashboard')} />;
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Welcome back, {state.user?.name}!</h1>
                  <p className="text-blue-100 mt-2">Manage your healthcare appointments and get medical guidance</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => setActiveView('book')}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Book Appointment</h3>
                    <p className="text-sm text-gray-600">Schedule with a doctor</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveView('appointments')}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                    <Calendar className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Appointments</h3>
                    <p className="text-sm text-gray-600">View your bookings</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveView('chat')}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Chat with Bot</h3>
                    <p className="text-sm text-gray-600">Get medical guidance</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveView('chat-history')}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <History className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Chat History</h3>
                    <p className="text-sm text-gray-600">View past conversations</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                <button
                  onClick={() => setActiveView('appointments')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        Scheduled
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming appointments</p>
                  <button
                    onClick={() => setActiveView('book')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Book your first appointment
                  </button>
                </div>
              )}
            </div>

            {/* Health Tips */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Health Tip of the Day</h2>
              <p className="text-gray-700">
                Stay hydrated! Drinking adequate water helps maintain body temperature, keeps joints lubricated, 
                and helps transport nutrients to cells. Aim for 8 glasses of water per day.
              </p>
            </div>
          </div>
        );
    }
  };

  return <div className="max-w-6xl mx-auto">{renderContent()}</div>;
};

export default PatientDashboard;