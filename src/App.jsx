import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import ReviewView from './components/ReviewView';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={
              <PrivateRoute>
                <DashboardView />
              </PrivateRoute>
            } />
            <Route path="/review/:id" element={
              <PrivateRoute>
                <ReviewView />
              </PrivateRoute>
            } />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
