'use client';

import { useDashboardStore } from '../store/useDashboardStore';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import FeedView from '../components/FeedView';
import ClustersView from '../components/ClustersView';
import AnalyticsView from '../components/AnalyticsView';
import PostDetailsModal from '../components/PostDetailsModal';

export default function Home() {
  const store = useDashboardStore();

  return (
    <div
      className="
        flex
        h-screen
        w-screen
        overflow-hidden
        font-sans
        text-slate-900
        antialiased
        bg-[linear-gradient(90deg,rgba(160,216,242,1)_0%,rgba(200,230,212,1)_27%,rgba(215,252,223,1)_64%,rgba(250,242,217,1)_100%)]
      "
    >
      {/* =========================
          LEFT SIDEBAR
      ========================= */}

      <Sidebar />

      {/* =========================
          MAIN DASHBOARD
      ========================= */}

      <main
        className="
          flex-1
          flex
          flex-col
          h-full
          overflow-hidden
          bg-white/10
          backdrop-blur-[2px]
        "
      >
        {/* =========================
            TOP HEADER
        ========================= */}

        <Header />

        {/* =========================
            DYNAMIC VIEW
        ========================= */}

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {store.activeTab === 'feed' && <FeedView />}
          {store.activeTab === 'clusters' && <ClustersView />}
          {store.activeTab === 'analytics' && <AnalyticsView />}
        </div>
      </main>

      {/* =========================
          GLOBAL MODAL
      ========================= */}

      <PostDetailsModal />
    </div>
  );
}