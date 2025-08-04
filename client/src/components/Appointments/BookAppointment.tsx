// src/components/BookAppointment.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { doctors as staticDoctors } from '../../data/doctors';
import { Doctor, Appointment } from '../../types';

interface BookAppointmentProps {
  onBack: () => void;
}

const BookAppointment: React.FC<BookAppointmentProps> = ({ onBack }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const { state, dispatch } = useApp();

  // Fetch real doctors + merge availability
  useEffect(() => {
    fetch('https://emmanueltigo.pythonanywhere.com/api/doctors')
      .then(res => res.json())
      .then((apiDoctors: Omit<Doctor, 'availability'>[]) => {
        const merged = apiDoctors.map(doc => {
          const local = staticDoctors.find(sd => sd.id === doc.id.toString());
          return { ...doc, availability: local?.availability || [] };
        });
        setDoctors(merged);
      })
      .catch(() => setDoctors(staticDoctors));
  }, []);

  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);

  const handleConfirm = async () => {
    if (!state.user || !selectedDoctor || !selectedDate || !selectedTime) return;

    setIsConfirming(true);
    try {
      // Build the payload
      const payload = {
        userId: state.user.id,
        doctorId: selectedDoctor,
        doctorName: selectedDoctorData!.name,
        patientName: state.user.name,
        date: selectedDate,
        time: selectedTime,
        status: 'scheduled'
      };

      // POST to API
      const res = await fetch('https://emmanueltigo.pythonanywhere.com/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error('Failed to book appointment');
        setIsConfirming(false);
        return;
      }

      const json = await res.json(); // { id: <newId> }
      const newAppointment: Appointment = {
        id: json.id.toString(),
        ...payload,
        createdAt: new Date().toISOString(),
      };

      // 📣 Dispatch into global state
      dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });

      // Show confirmation
      setIsBooked(true);
      setTimeout(() => onBack(), 2000);

    } catch (err) {
      console.error('Error booking appointment:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  const canProceed = Boolean(selectedDoctor && selectedDate && selectedTime);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (isBooked) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Confirmation UI unchanged */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Appointment Booked!</h2>
          <p className="text-gray-600 mb-2">Your appointment has been successfully scheduled.</p>
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <p className="font-medium text-gray-900">{selectedDoctorData?.name}</p>
            <p className="text-gray-600">{selectedDoctorData?.specialty}</p>
            <p className="text-gray-600 mt-2">
              {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header unchanged */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-2">Schedule your consultation with our healthcare professionals</p>
        </div>

        <div className="space-y-8">
          {/* Doctor Selection (unchanged) */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              <User className="inline w-5 h-5 mr-2" />
              Select Doctor
            </label>
            <div className="grid grid-cols-1 gap-4">
              {doctors.map((doctor) => (
                <label
                  key={doctor.id}
                  className={`relative block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedDoctor === doctor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="doctor"
                    value={doctor.id}
                    checked={selectedDoctor === doctor.id}
                    onChange={() => setSelectedDoctor(doctor.id)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-gray-600">{doctor.specialty}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Selection (unchanged) */}
          <div>
            <label htmlFor="date" className="block text-lg font-semibold text-gray-900 mb-4">
              <Calendar className="inline w-5 h-5 mr-2" />
              Select Date
            </label>
            <input
              id="date"
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Time Selection (unchanged) */}
          {selectedDoctorData && selectedDoctorData.availability.length > 0 && (
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                <Clock className="inline w-5 h-5 mr-2" />
                Select Time
              </label>
              <div className="grid grid-cols-3 gap-3">
                {selectedDoctorData.availability.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    type="button"
                    className={`p-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedTime === time
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation (unchanged) */}
          {canProceed && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Appointment Summary</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Doctor:</strong> {selectedDoctorData?.name}</p>
                <p><strong>Specialty:</strong> {selectedDoctorData?.specialty}</p>
                <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
              </div>
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              >
                {isConfirming ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
