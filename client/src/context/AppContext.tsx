import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Appointment, ChatMessage } from '../types';

interface AppState {
  user: User | null;
  appointments: Appointment[];
  chatHistory: ChatMessage[];
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'CANCEL_APPOINTMENT'; payload: string }
  | { type: 'SET_APPOINTMENTS'; payload: Appointment[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CHAT_HISTORY'; payload: ChatMessage[] }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  user: null,
  appointments: [],
  chatHistory: [],
  isLoading: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'CANCEL_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(app =>
          app.id === action.payload ? { ...app, status: 'cancelled' as const } : app
        ),
      };
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'SET_CHAT_HISTORY':
      return { ...state, chatHistory: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('medicalApp_user');
    if (savedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
    }

    // Load appointments from localStorage
    const savedAppointments = localStorage.getItem('medicalApp_appointments');
    if (savedAppointments) {
      dispatch({ type: 'SET_APPOINTMENTS', payload: JSON.parse(savedAppointments) });
    }

    // Load chat history from localStorage
    const savedChatHistory = localStorage.getItem('medicalApp_chatHistory');
    if (savedChatHistory) {
      dispatch({ type: 'SET_CHAT_HISTORY', payload: JSON.parse(savedChatHistory) });
    }
  }, []);

  useEffect(() => {
    // Save appointments to localStorage
    localStorage.setItem('medicalApp_appointments', JSON.stringify(state.appointments));
  }, [state.appointments]);

  useEffect(() => {
    // Save chat history to localStorage
    localStorage.setItem('medicalApp_chatHistory', JSON.stringify(state.chatHistory));
  }, [state.chatHistory]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};