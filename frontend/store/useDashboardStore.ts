import { create } from 'zustand';
import { Platform, Category, Sentiment } from 'shared';

export interface DashboardState {
  search: string;
  platform: Platform | 'all';
  category: Category | 'all';
  language: string | 'all';
  sentiment: Sentiment | 'all';
  isGibberish: boolean;
  page: number;
  limit: number;
  sortBy: 'created_at' | 'engagement_score';
  sortOrder: 'ASC' | 'DESC';
  selectedPostId: string | null;
  activeTab: 'feed' | 'clusters' | 'analytics';
  
  setSearch: (search: string) => void;
  setPlatform: (platform: Platform | 'all') => void;
  setCategory: (category: Category | 'all') => void;
  setLanguage: (language: string | 'all') => void;
  setSentiment: (sentiment: Sentiment | 'all') => void;
  setIsGibberish: (isGibberish: boolean) => void;
  setPage: (page: number) => void;
  setSortBy: (sortBy: 'created_at' | 'engagement_score') => void;
  setSortOrder: (sortOrder: 'ASC' | 'DESC') => void;
  setSelectedPostId: (postId: string | null) => void;
  setActiveTab: (tab: 'feed' | 'clusters' | 'analytics') => void;
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  search: '',
  platform: 'all',
  category: 'all',
  language: 'all',
  sentiment: 'all',
  isGibberish: false,
  page: 1,
  limit: 10,
  sortBy: 'created_at',
  sortOrder: 'DESC',
  selectedPostId: null,
  activeTab: 'feed',

  setSearch: (search) => set({ search, page: 1 }),
  setPlatform: (platform) => set({ platform, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setLanguage: (language) => set({ language, page: 1 }),
  setSentiment: (sentiment) => set({ sentiment, page: 1 }),
  setIsGibberish: (isGibberish) => set({ isGibberish, page: 1 }),
  setPage: (page) => set({ page }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  setSortOrder: (sortOrder) => set({ sortOrder, page: 1 }),
  setSelectedPostId: (selectedPostId) => set({ selectedPostId }),
  setActiveTab: (activeTab) => set({ activeTab }),
  resetFilters: () => set({
    search: '',
    platform: 'all',
    category: 'all',
    language: 'all',
    sentiment: 'all',
    isGibberish: false,
    page: 1,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  })
}));
