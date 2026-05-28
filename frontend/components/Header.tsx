'use client';

import React, { useState } from 'react';

import { useDashboardStore } from '../store/useDashboardStore';

import {
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import {
  Search,
  Download,
  Loader2,
  RefreshCw,
  BarChart3,
  Rss,
  Network
} from 'lucide-react';

export default function Header() {
  const store = useDashboardStore();

  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] =
    useState(store.search);

  /*  
     SEARCH
    */

  const triggerSearch = () => {
    store.setSearch(searchInput);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent
  ) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  /*  
     SCRAPER
    */

  const scrapeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/scrape`,
        {
          method: 'POST'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to run scraper');
      }

      return response.json();
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['posts']
      });

      queryClient.invalidateQueries({
        queryKey: ['analytics']
      });

      alert(
        `Scraper finished! Found ${data.scraped} posts. Added ${data.new} new posts.`
      );
    },

    onError: (err) => {
      console.error('Scraper trigger error:', err);

      alert(
        'Error triggering scrapers. Please check if backend is running.'
      );
    }
  });

  /*  
     EXPORT QUERY
    */

  const getQueryString = () => {
    const params = new URLSearchParams();

    if (store.platform !== 'all') {
      params.append('platform', store.platform);
    }

    if (store.category !== 'all') {
      params.append('category', store.category);
    }

    if (store.language !== 'all') {
      params.append('language', store.language);
    }

    if (store.sentiment !== 'all') {
      params.append('sentiment', store.sentiment);
    }

    if (store.isGibberish) {
      params.append('isGibberish', 'true');
    }

    if (store.search) {
      params.append('search', store.search);
    }

    return params.toString();
  };

  const handleExportCsv = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/api/export/csv?${getQueryString()}`,
      '_blank'
    );
  };

  const handleExportPdf = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/api/export/pdf?${getQueryString()}`,
      '_blank'
    );
  };

  return (
    <header
      className="
        h-16
        px-5
        border-b
        border-black/10
        bg-white/25
        backdrop-blur-xl
        flex
        items-center
        justify-between
        gap-4
        select-none
      "
    >
      {/*  
          SEARCH
        */}

      <div className="flex-1 max-w-sm relative flex items-center">
        <input
          type="text"
          value={searchInput}
          onChange={(e) =>
            setSearchInput(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Search feeds..."
          className="
            w-full
            h-10
            pl-9
            pr-20
            rounded-lg
            border
            border-black/10
            bg-white/60
            text-[12px]
            font-medium
            text-slate-800
            placeholder:text-slate-500
            outline-none
            transition-all
            focus:bg-white
            focus:border-slate-400
          "
        />

        {/* ICON */}

        <div className="absolute left-3 text-slate-500">
          <Search className="w-3.5 h-3.5" />
        </div>

        {/* BUTTON */}

        <button
          onClick={triggerSearch}
          className="
            absolute
            right-1.5
            h-7
            px-3
            rounded-md
            bg-[#020817]
            text-white
            text-[11px]
            font-semibold
            hover:bg-slate-800
            transition-all
            cursor-pointer
          "
        >
          Search
        </button>
      </div>

      {/*  
          NAVIGATION
        */}

      <div
        className="
          flex
          items-center
          gap-1
          p-1
          rounded-lg
          border
          border-black/10
          bg-white/45
        "
      >
        {/* FEED */}

        <button
          onClick={() =>
            store.setActiveTab('feed')
          }
          className={`
            h-9
            px-3
            rounded-md
            flex
            items-center
            gap-1.5
            text-[11px]
            font-semibold
            transition-all
            cursor-pointer
            ${
              store.activeTab === 'feed'
                ? `
                  bg-[#020817]
                  text-white
                  shadow-[0_4px_14px_rgba(2,8,23,0.16)]
                `
                : `
                  text-slate-700
                  hover:bg-white/70
                `
            }
          `}
        >
          <Rss className="w-3.5 h-3.5" />
          Feed
        </button>

        {/* CLUSTERS */}

        <button
          onClick={() =>
            store.setActiveTab('clusters')
          }
          className={`
            h-9
            px-3
            rounded-md
            flex
            items-center
            gap-1.5
            text-[11px]
            font-semibold
            transition-all
            cursor-pointer
            ${
              store.activeTab === 'clusters'
                ? `
                  bg-[#020817]
                  text-white
                  shadow-[0_4px_14px_rgba(2,8,23,0.16)]
                `
                : `
                  text-slate-700
                  hover:bg-white/70
                `
            }
          `}
        >
          <Network className="w-3.5 h-3.5" />
          Clusters
        </button>

        {/* ANALYTICS */}

        <button
          onClick={() =>
            store.setActiveTab('analytics')
          }
          className={`
            h-9
            px-3
            rounded-md
            flex
            items-center
            gap-1.5
            text-[11px]
            font-semibold
            transition-all
            cursor-pointer
            ${
              store.activeTab === 'analytics'
                ? `
                  bg-[#020817]
                  text-white
                  shadow-[0_4px_14px_rgba(2,8,23,0.16)]
                `
                : `
                  text-slate-700
                  hover:bg-white/70
                `
            }
          `}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Analytics
        </button>
      </div>

      {/*  
          ACTIONS
        */}

      <div className="flex items-center gap-2">
        {/* SCRAPER */}

        <button
          onClick={() =>
            scrapeMutation.mutate()
          }
          disabled={scrapeMutation.isPending}
          className="
            h-10
            px-4
            rounded-lg
            bg-[#020817]
            hover:bg-slate-800
            disabled:opacity-50
            flex
            items-center
            gap-2
            text-white
            text-[11px]
            font-semibold
            transition-all
            cursor-pointer
          "
        >
          {scrapeMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Trigger Scraper
            </>
          )}
        </button>

        {/* EXPORTS */}

        <div
          className="
            flex
            items-center
            border
            border-black/10
            bg-white/45
            rounded-lg
            overflow-hidden
          "
        >
          {/* CSV */}

          <button
            onClick={handleExportCsv}
            className="
              h-10
              px-3
              flex
              items-center
              gap-1.5
              text-[11px]
              font-semibold
              text-slate-700
              hover:bg-white/70
              transition-all
              cursor-pointer
            "
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <div className="w-px h-4 bg-black/10" />

          {/* PDF */}

          <button
            onClick={handleExportPdf}
            className="
              h-10
              px-3
              flex
              items-center
              gap-1.5
              text-[11px]
              font-semibold
              text-slate-700
              hover:bg-white/70
              transition-all
              cursor-pointer
            "
            title="Export PDF"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </button>
        </div>
      </div>
    </header>
  );
}