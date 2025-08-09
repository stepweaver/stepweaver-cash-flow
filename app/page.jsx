'use client';

import { useState } from 'react';
import BusinessTracker from '@/components/BusinessTracker.jsx';
import PersonalTracker from '@/components/PersonalTracker.jsx';

export default function Home() {
  const [activeTab, setActiveTab] = useState('business');

  return (
    <div className='min-h-screen bg-terminal-dark'>
      {/* Header */}
      <header className='bg-terminal-light shadow-sm border-b border-terminal-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <h1 className='text-2xl font-bold text-terminal-green font-ibm'>
              λstepweaver Cash Flow
            </h1>
            <div className='flex space-x-1'>
              <button
                onClick={() => setActiveTab('business')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors font-ocr cursor-pointer ${
                  activeTab === 'business'
                    ? 'bg-terminal-green text-black border border-terminal-green'
                    : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-light'
                }`}
              >
                λstepweaver
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors font-ocr cursor-pointer ${
                  activeTab === 'personal'
                    ? 'bg-terminal-green text-black border border-terminal-green'
                    : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-light'
                }`}
              >
                Personal
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {activeTab === 'business' ? <BusinessTracker /> : <PersonalTracker />}
      </main>
    </div>
  );
}
