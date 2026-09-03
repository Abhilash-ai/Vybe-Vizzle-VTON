import React from 'react';

export type TabType = 'test' | 'experiments' | 'comparison' | 'optimization';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  experimentCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, experimentCount }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="font-bold text-gray-900 tracking-tight text-base font-mono">
              VIZZLE
            </div>
            <div className="text-xs text-gray-500 hidden sm:block">
              / Virtual Try-On Model Evaluation Workbench
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('test')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'test'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Test
            </button>

            <button
              onClick={() => setActiveTab('experiments')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                activeTab === 'experiments'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>Experiments</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'experiments' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {experimentCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'comparison'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Comparison
            </button>

            <button
              onClick={() => setActiveTab('optimization')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'optimization'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              IDM-VTON Optimization
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
