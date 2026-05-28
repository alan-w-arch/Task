'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  useDashboardStore,
  type DashboardState
} from '../store/useDashboardStore';

import {
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
  const [isMobile, setIsMobile] = useState(false);

  /*  
     QUERY URL
    */

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

    return `${process.env.NEXT_PUBLIC_API_URL}/api/posts?${params.toString()}`;
  };

  /*  
     FETCH
    */

  const { data, isLoading, isFetching, error } =
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

  /*  
     ERROR
    */

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

  const posts = useMemo<Post[]>(
    () => data?.data ?? [],
    [data]
  );

  const meta = data?.meta ?? {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  };

  const visiblePosts = posts;

  useEffect(() => {
    const updateMobile = () =>
      setIsMobile(window.innerWidth < 768);

    updateMobile();
    window.addEventListener('resize', updateMobile);

    return () => {
      window.removeEventListener('resize', updateMobile);
    };
  }, []);



  return (
    <div className="flex-1 flex flex-col h-full">
      {/*  
          TOP ACTION BAR - Responsive
        */}

      <div
        className="
          h-auto
          md:h-14
          px-3
          md:px-6
          py-2
          md:py-0
          border-b
          border-black/10
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-2
          md:gap-3
          bg-white/20
          backdrop-blur-xl
        "
      >
        {/* LEFT */}

        <div className="hidden md:block text-[10px] md:text-[11px] text-slate-700 font-medium">
          Showing{' '}
          <span className="font-bold text-slate-900">
            {visiblePosts.length}
          </span>{' '}
          of{' '}
          <span className="font-bold text-slate-900">
            {meta.total}
          </span>{' '}
          posts
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-1 md:gap-3 flex-wrap">
          {/* SORT BY */}

          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-[10px] md:text-[11px] font-medium text-slate-600 hidden sm:inline">
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
                h-7
                md:h-8
                px-2
                md:px-2.5
                rounded-md
                border
                border-black/10
                bg-white/60
                text-[10px]
                md:text-[11px]
                text-slate-800
                font-medium
                outline-none
                cursor-pointer
              "
            >
              <option value="created_at">
                Date
              </option>

              <option value="engagement_score">
                Engagement
              </option>
            </select>
          </div>

          {/* ORDER */}

          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-[10px] md:text-[11px] font-medium text-slate-600 hidden sm:inline">
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
                h-7
                md:h-8
                px-2
                md:px-2.5
                rounded-md
                border
                border-black/10
                bg-white/60
                text-[10px]
                md:text-[11px]
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

          {/* PAGINATION */}

          <div className="flex items-center gap-1 md:gap-2 border-l border-black/10 pl-2 md:pl-3">
            <button
              onClick={() =>
                store.setPage(
                  Math.max(1, store.page - 1)
                )
              }
              disabled={store.page === 1}
              className="
                w-6
                md:w-7
                h-6
                md:h-7
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
              title="Previous page"
            >
              <ChevronLeft className="w-3 md:w-3.5 h-3 md:h-3.5" />
            </button>

            <span className="text-[9px] md:text-[10px] text-slate-700 font-medium whitespace-nowrap">
              <span className="font-bold">{store.page}</span> / {meta.pages || 1}
            </span>

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
                w-6
                md:w-7
                h-6
                md:h-7
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
              title="Next page"
            >
              <ChevronRight className="w-3 md:w-3.5 h-3 md:h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/*  
          FEED LIST - Responsive
        */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-3
          md:px-5
          py-3
          md:py-5
          flex
          flex-col
          gap-2
          md:gap-3
          custom-scrollbar
        "
      >
        {/*  
            LOADING
          */}

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
        ) : visiblePosts.length === 0 ? (
          /*  
              EMPTY
            */

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
          /*  
              POSTS
            */

          visiblePosts.map((post) => {
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
                    rounded-lg
                    md:rounded-xl
                    border
                    border-black/8
                    bg-white/45
                    backdrop-blur-xl
                    px-3
                    md:px-4
                    py-3
                    md:py-4
                    cursor-pointer
                    transition-all
                    duration-200
                    hover:bg-white/70
                    hover:border-black/15
                    hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)]
                  "
              >
                {/*  
                      TOP - Responsive Layout
                    */}

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                  {/* LEFT */}

                  <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                    {/* PLATFORM */}

                    <div
                      className={`
                          w-8
                          md:w-9
                          h-8
                          md:h-9
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          border
                          flex-shrink-0
                          ${post.platform === 'reddit'
                          ? 'bg-orange-50 border-orange-200 text-orange-500'
                          : post.platform === 'youtube'
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'bg-sky-50 border-sky-200 text-sky-500'
                        }
                        `}
                    >
                      {post.platform === 'reddit' && (
                        <span className="text-[10px] md:text-[11px] font-bold">
                          r/
                        </span>
                      )}

                      {post.platform === 'youtube' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-0.145 -0.145 4 4" id="Youtube--Streamline-Flex" height={16} width={16} ><desc>{"\n    Youtube Streamline Icon: https://streamlinehq.com\n  "}</desc><g id="youtube--youtube-clip-social-video"><path id="Intersect" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" d="M0.3021 2.40726c0.044255 0.38027500000000003 0.36040000000000005 0.67999 0.742 0.714705 0.26394 0.02385 0.53477 0.044255 0.8109000000000001 0.044255 0.27613000000000004 0 0.54696 -0.020405 0.8109000000000001 -0.044255 0.3816 -0.03445 0.6977450000000001 -0.33443 0.742 -0.714705 0.0212 -0.18073000000000003 0.03710000000000001 -0.36517 0.03710000000000001 -0.5522600000000001 0 -0.18709 -0.0159 -0.37152999999999997 -0.03710000000000001 -0.5522600000000001 -0.044255 -0.38027500000000003 -0.36040000000000005 -0.67999 -0.742 -0.714705 -0.26394 -0.02385 -0.53477 -0.044255 -0.8109000000000001 -0.044255 -0.27613000000000004 0 -0.54696 0.020405 -0.8109000000000001 0.044255 -0.3816 0.034715 -0.6977450000000001 0.33443 -0.742 0.714705A4.74615 4.74615 0 0 0 0.265 1.855c0 0.18709 0.0159 0.37152999999999997 0.03710000000000001 0.5522600000000001Z" strokeWidth={0.29} /><path id="Intersect_2" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" d="M1.79776 2.4539C2.12212 2.2800599999999998 2.5426750000000005 2.02248 2.5426750000000005 1.855c0 -0.16748000000000002 -0.420555 -0.42506000000000005 -0.744915 -0.5989 -0.17039500000000002 -0.09115999999999999 -0.369145 0.034980000000000004 -0.369145 0.228165l0 0.7414700000000001c0 0.193185 0.19875 0.319325 0.369145 0.22790000000000002Z" strokeWidth={0.29} /></g></svg>
                      )}

                      {post.platform === 'twitter' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" className="bi bi-twitter-x" viewBox="0 0 16 16" id="Twitter-X--Streamline-Bootstrap" height={14} width={14} ><desc>{"\n    Twitter X Streamline Icon: https://streamlinehq.com\n  "}</desc><path d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867 -5.07 -4.425 5.07H0.316l5.733 -6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z" strokeWidth={1} /></svg>
                      )}
                    </div>

                    {/* AUTHOR */}

                    <div className="min-w-0 flex-1">
                      <div
                        className="
                            text-[11px]
                            md:text-[12px]
                            font-bold
                            text-slate-900
                            truncate
                          "
                      >
                        {post.author}
                      </div>

                      <div
                        className="
                            mt-0.5
                            md:mt-1
                            flex
                            items-center
                            gap-1
                            md:gap-1.5
                            text-[9px]
                            md:text-[10px]
                            text-slate-500
                            font-medium
                            flex-wrap
                          "
                      >
                        <span className="truncate">{post.handle}</span>

                        <span className="hidden sm:inline">•</span>

                        <Clock className="w-2 md:w-2.5 h-2 md:h-2.5 flex-shrink-0 hidden sm:inline" />

                        <span className="hidden sm:inline truncate">{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* BADGES - Responsive Grid */}

                  <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
                    {/* LANGUAGE */}

                    <span
                      className="
                          px-1.5
                          md:px-2
                          h-5
                          md:h-6
                          rounded-md
                          border
                          border-black/8
                          bg-white/70
                          text-[9px]
                          md:text-[10px]
                          font-bold
                          uppercase
                          text-slate-700
                          flex
                          items-center
                          text-nowrap
                        "
                    >
                      {post.language || 'en'}
                    </span>

                    {/* SENTIMENT */}

                    <span
                      className={`
                          px-1.5
                          md:px-2
                          h-5
                          md:h-6
                          rounded-md
                          text-[9px]
                          md:text-[10px]
                          font-bold
                          uppercase
                          flex
                          items-center
                          border
                          text-nowrap
                          ${post.sentiment === 'positive'
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
                            px-1.5
                            md:px-2
                            h-5
                            md:h-6
                            rounded-md
                            bg-slate-900
                            text-white
                            text-[9px]
                            md:text-[10px]
                            font-bold
                            flex
                            items-center
                            text-nowrap
                          "
                      >
                        {post.category}
                      </span>
                    )}

                    {/* SCORE */}

                    <span
                      className="
                          px-1.5
                          md:px-2
                          h-5
                          md:h-6
                          rounded-md
                          bg-slate-100
                          border
                          border-black/8
                          text-[9px]
                          md:text-[10px]
                          font-bold
                          text-slate-700
                          flex
                          items-center
                          gap-0.5
                          md:gap-1
                          text-nowrap
                        "
                    >
                      <TrendingUp className="w-2 md:w-2.5 h-2 md:h-2.5" />
                      {post.engagement_score}
                    </span>
                  </div>
                </div>

                {/*  
                      SUMMARY - Mobile Optimized
                    */}

                {post.summary && (
                  <div
                    className="
                        mt-2
                        md:mt-4
                        rounded-lg
                        border
                        border-slate-200
                        bg-slate-50/80
                        px-2
                        md:px-3
                        py-2
                        md:py-2.5
                      "
                  >
                    <div
                      className="
                          text-[9px]
                          md:text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-slate-700
                          mb-1
                          md:mb-1.5
                        "
                    >
                      AI Summary
                    </div>

                    <p
                      className="
                          text-[10px]
                          md:text-[11px]
                          leading-relaxed
                          text-slate-700
                          line-clamp-2
                          md:line-clamp-3
                        "
                    >
                      {post.summary}
                    </p>
                  </div>
                )}

                {/*  
                      CONTENT - Mobile Responsive
                    */}

                <div
                  className="
                      mt-2
                      md:mt-4
                      text-[10px]
                      md:text-[12px]
                      leading-relaxed
                      text-slate-700
                      line-clamp-2
                      md:line-clamp-3
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

                {/*  
                      FOOTER
                    */}

                {post?.cluster_name && (
                  <div
                    className="
                        mt-2
                        md:mt-4
                        flex
                        items-center
                        gap-1
                        md:gap-1.5
                        text-[9px]
                        md:text-[10px]
                        font-semibold
                        text-slate-500
                        truncate
                      "
                  >
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-slate-400 flex-shrink-0" />

                    <span className="hidden sm:inline">Part of Thread:</span>
                    <span className="text-slate-800 truncate">
                      {post?.cluster_name}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}

      </div>

      {/*  
          FOOTER - Responsive
        */}

      <footer
        className="
          hidden
          md:flex
          h-auto
          md:h-14
          px-3
          md:px-5
          py-2
          md:py-0
          border-t
          border-black/10
          bg-white/20
          backdrop-blur-xl
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-2
          md:gap-3
        "
      >
        <div className="text-[10px] md:text-[11px] text-slate-700 font-medium">
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
              w-7
              md:w-8
              h-7
              md:h-8
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
            <ChevronLeft className="w-3.5 md:w-4 h-3.5 md:h-4" />
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
              w-7
              md:w-8
              h-7
              md:h-8
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
            <ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}