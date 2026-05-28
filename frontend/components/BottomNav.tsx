'use client';

import React from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Rss,
  Network,
  BarChart3,
  RefreshCw,
  Loader2
} from 'lucide-react';

export default function BottomNav() {
  const store = useDashboardStore();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      alert(`Scraper finished! Found ${data.scraped} posts.`);
    },
    onError: () => {
      alert('Error triggering scraper. Please check the backend.');
    }
  });

  const navItems = [
    {
      key: 'feed' as const,
      label: 'Feed',
      icon: Rss
    },
    {
      key: 'clusters' as const,
      label: 'Clusters',
      icon: Network
    },
    {
      key: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3
    }
  ];

  return (
    <div className="lg:hidden fixed left-0 right-0 bottom-0 z-50">
      <div className="relative  shadow-[0_-20px_80px_rgba(15,23,42,0.15)] px-1 pt-1 pb-1">
        <div className="absolute -top-14 right-4">
          <button
            onClick={() => scrapeMutation.mutate()}
            disabled={scrapeMutation.isPending}
            className="
              w-12
              h-12
              rounded-full
              bg-[#020817]
              text-white
              flex
              items-center
              justify-center
              shadow-[0_12px_30px_rgba(2,8,23,0.24)]
              transition-all
              duration-200
              hover:bg-slate-900
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
            title="Run scraper"
          >
            {scrapeMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = store.activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => store.setActiveTab(item.key)}
                className={`
                  flex-1
                  min-w-0
                  rounded-md
                  border
                  px-3
                  py-2
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  text-[10px]
                  font-semibold
                  transition-all
                  ${
                    isActive
                      ? 'bg-[#020817] text-white border-[#020817]'
                      : 'bg-white text-slate-700 border-black/10 hover:bg-slate-50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
