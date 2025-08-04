import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import AuthPage from './components/Auth/AuthPage';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';

const AppContent: React.FC = () => {
  const { state } = useApp();

  if (!state.user) {
    return <AuthPage />;
  }

  return (
    <Layout>
      {state.user.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />}
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;