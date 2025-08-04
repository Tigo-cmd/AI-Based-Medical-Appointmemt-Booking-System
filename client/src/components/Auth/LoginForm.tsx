// LoginForm.tsx
import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getUsers } from '../../utils/storage';
import { User } from '../../types';

interface LoginFormProps {
  onToggleMode: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { dispatch } = useApp();

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');

  //   const users = getUsers();
  //   const user = users.find(u => u.email === email);

  //   if (!user) {
  //     setError('User not found. Please register first.');
  //     return;
  //   }

  //   // In a real app, you'd hash and compare passwords
  //   if (password === 'password') {
  //     localStorage.setItem('medicalApp_user', JSON.stringify(user));
  //     dispatch({ type: 'SET_USER', payload: user });
  //   } else {
  //     setError('Invalid password.');
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://emmanueltigo.pythonanywhere.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
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
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to access your healthcare dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

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
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
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
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center space-x-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register now</span>
            </button>
          </p>
        </div>
{/* 
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Demo:</strong> Use any email and password "password" to login, or register a new account.<br/>
            <strong>Doctor Login:</strong> Use any doctor email from the list (e.g., sarah.johnson@medicare.com) with password "password"
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginForm;