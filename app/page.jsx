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
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 sm:py-8'>
            <div className='mb-4 sm:mb-0 text-center sm:text-left'>
              <h1 className='text-2xl sm:text-4xl font-bold text-terminal-green font-ibm'>
                λstepweaver Cash Flow
              </h1>
            </div>
            <div className='flex space-x-3 justify-center'>
              <button
                onClick={() => setActiveTab('business')}
                className={`px-6 py-3 text-sm font-medium rounded-md transition-colors font-ocr cursor-pointer ${
                  activeTab === 'business'
                    ? 'bg-terminal-green text-black border border-terminal-green shadow-md'
                    : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-dark border border-terminal-border'
                }`}
              >
                λstepweaver
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-3 text-sm font-medium rounded-md transition-colors font-ocr cursor-pointer ${
                  activeTab === 'personal'
                    ? 'bg-terminal-green text-black border border-terminal-green shadow-md'
                    : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-dark border border-terminal-border'
                }`}
              >
                Personal
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        <div className='space-y-8'>
          {activeTab === 'business' ? <BusinessTracker /> : <PersonalTracker />}
        </div>
      </main>
    </div>
  );
}
