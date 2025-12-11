import React from 'react';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import ReviewView from './components/ReviewView';

const AppContent = () => {
  const { view } = useApp();

  return (
    <Layout>
      {view === 'dashboard' && <DashboardView />}
      {view === 'review' && <ReviewView />}
    </Layout>
  );
};

function App() {
  return (
    <AppContent />
  );
}

export default App;
