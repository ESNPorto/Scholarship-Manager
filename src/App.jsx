import React from 'react';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import ReviewView from './components/ReviewView';
import SummaryView from './components/SummaryView';

const AppContent = () => {
  const { view } = useApp();

  return (
    <Layout>
      {view === 'dashboard' && <DashboardView />}
      {view === 'review' && <ReviewView />}
      {view === 'summary' && <SummaryView />}
    </Layout>
  );
};

function App() {
  return (
    <AppContent />
  );
}

export default App;
