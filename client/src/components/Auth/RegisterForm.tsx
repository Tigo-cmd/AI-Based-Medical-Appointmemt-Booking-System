// RegisterForm.tsx
import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, LogIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getUsers, saveUsers } from '../../utils/storage';
import { User as UserType } from '../../types';

interface RegisterFormProps {
  onToggleMode: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [specialty, setSpecialty] = useState('');
  const [error, setError] = useState('');
  const { dispatch } = useApp();

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');

  //   if (password !== confirmPassword) {
  //     setError('Passwords do not match.');
  //     return;
  //   }

  //   if (password.length < 6) {
  //     setError('Password must be at least 6 characters long.');
  //     return;
  //   }

  //   const users = getUsers();
  //   const existingUser = users.find(u => u.email === email);

  //   if (existingUser) {
  //     setError('Email already registered. Please use a different email.');
  //     return;
  //   }

  //   const newUser: UserType = {
  //     id: Date.now().toString(),
  //     email,
  //     name,
  //     role,
  //     ...(role === 'doctor' && { specialty })
  //   };

  //   const updatedUsers = [...users, newUser];
  //   saveUsers(updatedUsers);
  //   localStorage.setItem('medicalApp_user', JSON.stringify(newUser));
  //   dispatch({ type: 'SET_USER', payload: newUser });
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const res = await fetch('https://emmanueltigo.pythonanywhere.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, specialty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('medicalApp_user', JSON.stringify(data));
      dispatch({ type: 'SET_USER', payload: data });
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join MediCare for better healthcare access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative block p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                role === 'patient' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={role === 'patient'}
                  onChange={(e) => setRole(e.target.value as 'patient' | 'doctor')}
                  className="sr-only"
                />
                <div className="text-center">
                  <User className="w-6 h-6 mx-auto mb-1 text-teal-600" />
                  <span className="text-sm font-medium">Patient</span>
                </div>
              </label>
              <label className={`relative block p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                role === 'doctor' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={role === 'doctor'}
                  onChange={(e) => setRole(e.target.value as 'patient' | 'doctor')}
                  className="sr-only"
                />
                <div className="text-center">
                  <User className="w-6 h-6 mx-auto mb-1 text-teal-600" />
                  <span className="text-sm font-medium">Doctor</span>
                </div>
              </label>
            </div>
          </div>

          {role === 'doctor' && (
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                Medical Specialty
              </label>
              <input
                id="specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., General Practice, Cardiology"
                required={role === 'doctor'}
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-teal-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center space-x-1"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in</span>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;