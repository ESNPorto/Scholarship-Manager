import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import ReviewView from './components/ReviewView';

const AppContent = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/review/:id" element={<ReviewView />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AppContent />
  );
}

export default App;
