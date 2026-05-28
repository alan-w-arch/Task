'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  useDashboardStore,
  type DashboardState
} from '../store/useDashboardStore';

import {
  Twitter,
  Youtube,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

import type { Post } from '../shared';

type PostsApiResponse = {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export default function FeedView() {
  const store = useDashboardStore();

  /* =========================
     QUERY URL
  ========================= */

  const getQueryUrl = () => {
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

    params.append(
      'isGibberish',
      store.isGibberish ? 'true' : 'false'
    );

    if (store.search) {
      params.append('search', store.search);
    }

    params.append('page', String(store.page));
    params.append('limit', String(store.limit));
    params.append('sortBy', store.sortBy);
    params.append('sortOrder', store.sortOrder);

    return `http://localhost:3001/api/posts?${params.toString()}`;
  };

  /* =========================
     FETCH
  ========================= */

  const { data, isLoading, error } =
    useQuery<PostsApiResponse>({
      queryKey: [
        'posts',
        store.platform,
        store.category,
        store.language,
        store.sentiment,
        store.isGibberish,
        store.search,
        store.page,
        store.sortBy,
        store.sortOrder
      ],

      queryFn: async () => {
        const response = await fetch(getQueryUrl());

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        return response.json();
      }
    });

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-600">
        <ShieldAlert className="w-10 h-10 text-red-500" />

        <p className="font-semibold text-base">
          Error loading feeds
        </p>

        <p className="text-xs">
          Backend service unavailable on port 3001
        </p>
      </div>
    );
  }

  const posts: Post[] = data?.data ?? [];

  const meta = data?.meta ?? {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* =========================
          TOP ACTION BAR
      ========================= */}

      <div
        className="
          h-14
          px-6
          border-b
          border-black/10
          flex
          items-center
          justify-between
          bg-white/20
          backdrop-blur-xl
        "
      >
        {/* LEFT */}

        <div className="text-[11px] text-slate-700 font-medium">
          Showing{' '}
          <span className="font-bold text-slate-900">
            {posts.length}
          </span>{' '}
          of{' '}
          <span className="font-bold text-slate-900">
            {meta.total}
          </span>{' '}
          posts
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-3">
          {/* SORT BY */}

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-600">
              Sort
            </span>

            <select
              value={store.sortBy}
              onChange={(e) =>
                store.setSortBy(
                  e.target.value as DashboardState['sortBy']
                )
              }
              className="
                h-8
                px-2.5
                rounded-md
                border
                border-black/10
                bg-white/60
                text-[11px]
                text-slate-800
                font-medium
                outline-none
                cursor-pointer
              "
            >
              <option value="created_at">
                Date Scraped
              </option>

              <option value="engagement_score">
                Engagement
              </option>
            </select>
          </div>

          {/* ORDER */}

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-600">
              Order
            </span>

            <select
              value={store.sortOrder}
              onChange={(e) =>
                store.setSortOrder(
                  e.target.value as DashboardState['sortOrder']
                )
              }
              className="
                h-8
                px-2.5
                rounded-md
                border
                border-black/10
                bg-white/60
                text-[11px]
                text-slate-800
                font-medium
                outline-none
                cursor-pointer
              "
            >
              <option value="DESC">
                Newest
              </option>

              <option value="ASC">
                Oldest
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================
          FEED LIST
      ========================= */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-5
          py-5
          flex
          flex-col
          gap-3
          custom-scrollbar
        "
      >
        {/* =========================
            LOADING
        ========================= */}

        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="
                h-[150px]
                rounded-xl
                border
                border-black/8
                bg-white/45
                animate-pulse
              "
            />
          ))
        ) : posts.length === 0 ? (
          /* =========================
              EMPTY
          ========================= */

          <div
            className="
              flex-1
              flex
              flex-col
              items-center
              justify-center
              gap-3
              text-slate-600
            "
          >
            <MessageSquare className="w-10 h-10 text-slate-400" />

            <p className="text-sm font-semibold">
              No posts found
            </p>

            <p className="text-xs text-center max-w-xs">
              Try changing filters or resetting the feed.
            </p>
          </div>
        ) : (
          /* =========================
              POSTS
          ========================= */

          posts.map((post) => {
            const dateStr = new Date(
              post.created_at
            ).toLocaleString();

            return (
              <div
                key={post.id}
                onClick={() =>
                  store.setSelectedPostId(post.id)
                }
                className="
                  group
                  relative
                  rounded-xl
                  border
                  border-black/8
                  bg-white/45
                  backdrop-blur-xl
                  px-4
                  py-4
                  cursor-pointer
                  transition-all
                  duration-200
                  hover:bg-white/70
                  hover:border-black/15
                  hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)]
                "
              >
                {/* =========================
                    TOP
                ========================= */}

                <div className="flex items-start justify-between gap-4">
                  {/* LEFT */}

                  <div className="flex items-center gap-3">
                    {/* PLATFORM */}

                    <div
                      className={`
                        w-9
                        h-9
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        border
                        ${
                          post.platform === 'reddit'
                            ? 'bg-orange-50 border-orange-200 text-orange-500'
                            : post.platform === 'youtube'
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'bg-sky-50 border-sky-200 text-sky-500'
                        }
                      `}
                    >
                      {post.platform === 'reddit' && (
                        <span className="text-[11px] font-bold">
                          r/
                        </span>
                      )}

                      {post.platform === 'youtube' && (
                        <Youtube className="w-4 h-4" />
                      )}

                      {post.platform === 'twitter' && (
                        <Twitter className="w-4 h-4" />
                      )}
                    </div>

                    {/* AUTHOR */}

                    <div>
                      <div
                        className="
                          text-[12px]
                          font-bold
                          text-slate-900
                        "
                      >
                        {post.author}
                      </div>

                      <div
                        className="
                          mt-1
                          flex
                          items-center
                          gap-1.5
                          text-[10px]
                          text-slate-500
                          font-medium
                        "
                      >
                        <span>{post.handle}</span>

                        <span>•</span>

                        <Clock className="w-2.5 h-2.5" />

                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* BADGES */}

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {/* LANGUAGE */}

                    <span
                      className="
                        px-2
                        h-6
                        rounded-md
                        border
                        border-black/8
                        bg-white/70
                        text-[10px]
                        font-bold
                        uppercase
                        text-slate-700
                        flex
                        items-center
                      "
                    >
                      {post.language || 'en'}
                    </span>

                    {/* SENTIMENT */}

                    <span
                      className={`
                        px-2
                        h-6
                        rounded-md
                        text-[10px]
                        font-bold
                        uppercase
                        flex
                        items-center
                        border
                        ${
                          post.sentiment === 'positive'
                            ? 'bg-lime-50 text-lime-700 border-lime-200'
                            : post.sentiment === 'negative'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      `}
                    >
                      {post.sentiment || 'neutral'}
                    </span>

                    {/* CATEGORY */}

                    {post.category && (
                      <span
                        className="
                          px-2
                          h-6
                          rounded-md
                          bg-slate-900
                          text-white
                          text-[10px]
                          font-bold
                          flex
                          items-center
                        "
                      >
                        {post.category}
                      </span>
                    )}

                    {/* SCORE */}

                    <span
                      className="
                        px-2
                        h-6
                        rounded-md
                        bg-slate-100
                        border
                        border-black/8
                        text-[10px]
                        font-bold
                        text-slate-700
                        flex
                        items-center
                        gap-1
                      "
                    >
                      <TrendingUp className="w-2.5 h-2.5" />
                      {post.engagement_score}
                    </span>
                  </div>
                </div>

                {/* =========================
                    SUMMARY
                ========================= */}

                {post.summary && (
                  <div
                    className="
                      mt-4
                      rounded-lg
                      border
                      border-slate-200
                      bg-slate-50/80
                      px-3
                      py-2.5
                    "
                  >
                    <div
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-700
                        mb-1.5
                      "
                    >
                      AI Summary
                    </div>

                    <p
                      className="
                        text-[11px]
                        leading-relaxed
                        text-slate-700
                      "
                    >
                      {post.summary}
                    </p>
                  </div>
                )}

                {/* =========================
                    CONTENT
                ========================= */}

                <div
                  className="
                    mt-4
                    text-[12px]
                    leading-relaxed
                    text-slate-700
                    line-clamp-3
                  "
                >
                  {post.translated_content ? (
                    <span className="italic">
                      [Translated]{' '}
                      {post.translated_content}
                    </span>
                  ) : (
                    post.content
                  )}
                </div>

                {/* =========================
                    FOOTER
                ========================= */}

                {post?.cluster_name && (
                  <div
                    className="
                      mt-4
                      flex
                      items-center
                      gap-1.5
                      text-[10px]
                      font-semibold
                      text-slate-500
                    "
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />

                    Part of Thread:
                    <span className="text-slate-800">
                      {post?.cluster_name}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* =========================
          FOOTER
      ========================= */}

      <footer
        className="
          h-14
          px-5
          border-t
          border-black/10
          bg-white/20
          backdrop-blur-xl
          flex
          items-center
          justify-between
        "
      >
        <div className="text-[11px] text-slate-700 font-medium">
          Page{' '}
          <span className="font-bold text-slate-900">
            {meta.page}
          </span>{' '}
          of{' '}
          <span className="font-bold text-slate-900">
            {meta.pages || 1}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              store.setPage(
                Math.max(1, store.page - 1)
              )
            }
            disabled={store.page === 1}
            className="
              w-8
              h-8
              rounded-md
              border
              border-black/10
              bg-white/60
              flex
              items-center
              justify-center
              text-slate-700
              hover:bg-white
              transition-all
              disabled:opacity-40
              disabled:cursor-not-allowed
              cursor-pointer
            "
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              store.setPage(
                Math.min(
                  meta.pages,
                  store.page + 1
                )
              )
            }
            disabled={
              store.page === meta.pages ||
              meta.pages === 0
            }
            className="
              w-8
              h-8
              rounded-md
              border
              border-black/10
              bg-white/60
              flex
              items-center
              justify-center
              text-slate-700
              hover:bg-white
              transition-all
              disabled:opacity-40
              disabled:cursor-not-allowed
              cursor-pointer
            "
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}