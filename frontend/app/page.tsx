'use client';

import React, { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import FeedView from '../components/FeedView';
import ClustersView from '../components/ClustersView';
import AnalyticsView from '../components/AnalyticsView';
import PostDetailsModal from '../components/PostDetailsModal';
import BottomNav from '../components/BottomNav';
import { Menu, X } from 'lucide-react';

export default function Home() {
  const store = useDashboardStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="
        flex
        flex-col
        lg:flex-row
        h-screen
        w-screen
        overflow-hidden
        font-sans
        text-slate-900
        antialiased
        bg-[linear-gradient(90deg,rgba(160,216,242,1)_0%,rgba(200,230,212,1)_27%,rgba(215,252,223,1)_64%,rgba(250,242,217,1)_100%)]
      "
    >
      {/*  
          LEFT SIDEBAR - Desktop & Mobile
        */}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="
            fixed
            inset-0
            z-30
            bg-black/50
            lg:hidden
          "
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed
          lg:static
          left-0
          top-0
          z-40
          h-screen
          w-[290px]
          transform
          transition-transform
          duration-300
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
      </div>

      {/*  
          MAIN DASHBOARD
        */}

      <main
        className="
          flex-1
          flex
          flex-col
          w-full
          h-full
          overflow-hidden
          bg-white/10
          backdrop-blur-[2px]
        "
      >
        {/*  
            TOP HEADER with Mobile Menu
          */}

        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="
              lg:hidden
              p-3
              text-slate-900
              hover:bg-white/20
              transition-all
            "
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1">
            <Header />
          </div>
        </div>

        {/*  
            DYNAMIC VIEW
          */}

        <div className="flex-1 overflow-hidden relative flex flex-col pb-16 lg:pb-0">
          {store.activeTab === 'feed' && <FeedView />}
          {store.activeTab === 'clusters' && <ClustersView />}
          {store.activeTab === 'analytics' && <AnalyticsView />}
          <BottomNav />
        </div>
      </main>

      {/*  
          GLOBAL MODAL
        */}

      <PostDetailsModal />
    </div>
  );
}