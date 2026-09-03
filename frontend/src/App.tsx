import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { TryOnProvider, useTryOn } from './context/TryOnContext';
import { EvaluationWorkbenchPage } from './pages/EvaluationWorkbenchPage';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0D14] text-[#F1F5F9]">
      <EvaluationWorkbenchPage />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <TryOnProvider>
        <AppContent />
      </TryOnProvider>
    </AuthProvider>
  );
};

export default App;
