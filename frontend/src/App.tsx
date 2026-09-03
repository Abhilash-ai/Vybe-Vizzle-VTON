import React, { useState, useEffect } from 'react';
import { Navbar, type TabType } from './components/Navbar';
import { TestPage } from './pages/TestPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { OptimizationPage } from './pages/OptimizationPage';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('test');
  const [experimentCount, setExperimentCount] = useState<number>(0);

  const fetchExperimentCount = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/eval/experiments', { cache: 'no-store' });
      if (res.ok) {
        const list = await res.json();
        setExperimentCount(Array.isArray(list) ? list.length : 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExperimentCount();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        experimentCount={experimentCount}
      />

      <main className="flex-1">
        {activeTab === 'test' && (
          <TestPage onExperimentSaved={fetchExperimentCount} />
        )}

        {activeTab === 'experiments' && (
          <ExperimentsPage onRefreshNeeded={fetchExperimentCount} />
        )}

        {activeTab === 'comparison' && (
          <ComparisonPage />
        )}

        {activeTab === 'optimization' && (
          <OptimizationPage />
        )}
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 font-mono">
        VIZZLE Virtual Try-On Model Evaluation Workbench · 100% Empirical Data-Driven Architecture
      </footer>
    </div>
  );
}

export default App;
