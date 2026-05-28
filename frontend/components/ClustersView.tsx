'use client';

import React, { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useDashboardStore } from '../store/useDashboardStore';

import type { Post } from 'shared';

import {
  Network,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  TrendingUp,
  Clock
} from 'lucide-react';

type PostsApiResponse = {
  data: Array<Post & { cluster_name?: string }>;
};

export default function ClustersView() {
  const store = useDashboardStore();

  const [expandedClusterId, setExpandedClusterId] =
    useState<string | null>(null);

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

    params.append('isGibberish', 'false');

    if (store.search) {
      params.append('search', store.search);
    }

    params.append('limit', '100');

    return `${process.env.NEXT_PUBLIC_API_URL}/api/posts?${params.toString()}`;
  };

  /*  
     FETCH
    */

  const { data, isLoading, error } =
    useQuery<PostsApiResponse>({
      queryKey: [
        'cluster-posts',
        store.platform,
        store.category,
        store.language,
        store.sentiment,
        store.search
      ],

      queryFn: async () => {
        const response = await fetch(getQueryUrl());

        if (!response.ok) {
          throw new Error(
            'Network response was not ok'
          );
        }

        return response.json();
      }
    });

  /*  
     LOADING
    */

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-slate-700 animate-spin" />
      </div>
    );
  }

  /*  
     ERROR
    */

  if (error) {
    return (
      <div
        className="
          flex-1
          flex
          flex-col
          items-center
          justify-center
          gap-2
          text-slate-600
        "
      >
        <p className="font-semibold text-base">
          Error loading clusters
        </p>

        <p className="text-xs">
          Verify backend server and database.
        </p>
      </div>
    );
  }

  const posts = data?.data || [];

  /*  
     GROUP CLUSTERS
    */

  const clustersMap: Record<
    string,
    {
      id: string;
      name: string;
      posts: Array<Post & { cluster_name?: string }>;
    }
  > = {};

  posts.forEach((post) => {
    if (post.cluster_id) {
      if (!clustersMap[post.cluster_id]) {
        clustersMap[post.cluster_id] = {
          id: post.cluster_id,
          name:
            post.cluster_name ||
            'General Topic Thread',
          posts: []
        };
      }

      clustersMap[post.cluster_id].posts.push(
        post
      );
    }
  });

  const clustersList = Object.values(
    clustersMap
  ).sort((a, b) => b.posts.length - a.posts.length);

  /*  
     TOGGLE
    */

  const toggleExpand = (id: string) => {
    if (expandedClusterId === id) {
      setExpandedClusterId(null);
    } else {
      setExpandedClusterId(id);
    }
  };

  return (
    <div
      className="
        flex-1
        overflow-y-auto
        px-5
        py-5
        flex
        flex-col
        gap-4
        custom-scrollbar
      "
    >
      {/*  
          INTRO
        */}

      <div
        className="
          flex
          items-start
          gap-3
          rounded-xl
          border
          border-black/10
          bg-white/45
          backdrop-blur-xl
          px-4
          py-4
        "
      >
        <div
          className="
            w-10
            h-10
            rounded-lg
            bg-[#020817]
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          <Network className="w-5 h-5 text-white" />
        </div>

        <div>
          <h2
            className="
              text-[13px]
              font-bold
              text-slate-900
            "
          >
            Duplicate Clustering Thread View
          </h2>

          <p
            className="
              mt-1
              text-[11px]
              leading-relaxed
              text-slate-600
            "
          >
            Posts with high semantic similarity
            are grouped automatically into
            related discussion threads.
          </p>
        </div>
      </div>

      {/*  
          EMPTY
        */}

      {clustersList.length === 0 ? (
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
            No clusters detected
          </p>

          <p className="text-xs text-center max-w-xs">
            Related threads will appear here as
            new posts are processed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {clustersList.map((cluster) => {
            const isExpanded =
              expandedClusterId === cluster.id;

            const totalScore =
              cluster.posts.reduce(
                (sum, p) =>
                  sum + p.engagement_score,
                0
              );

            const platforms = Array.from(
              new Set(
                cluster.posts.map(
                  (p) => p.platform
                )
              )
            );

            return (
              <div
                key={cluster.id}
                className="
                  rounded-xl
                  border
                  border-black/10
                  bg-white/45
                  backdrop-blur-xl
                  overflow-hidden
                "
              >
                {/*  
                    HEADER
                  */}

                <div
                  onClick={() =>
                    toggleExpand(cluster.id)
                  }
                  className="
                    px-4
                    py-4
                    flex
                    items-center
                    justify-between
                    gap-4
                    cursor-pointer
                    transition-all
                    hover:bg-white/30
                  "
                >
                  {/* LEFT */}

                  <div className="flex-1 min-w-0">
                    <h3
                      className="
                        text-[13px]
                        font-bold
                        text-slate-900
                        truncate
                      "
                    >
                      {cluster.name}
                    </h3>

                    <div
                      className="
                        mt-1.5
                        flex
                        flex-wrap
                        items-center
                        gap-2
                        text-[10px]
                        font-semibold
                        text-slate-600
                      "
                    >
                      {/* POSTS */}

                      <span
                        className="
                          px-2
                          h-5
                          rounded-md
                          bg-[#020817]
                          text-white
                          flex
                          items-center
                        "
                      >
                        {cluster.posts.length}{' '}
                        posts
                      </span>

                      {/* ENGAGEMENT */}

                      <span
                        className="
                          flex
                          items-center
                          gap-1
                        "
                      >
                        <TrendingUp className="w-3 h-3" />
                        {totalScore} engagement
                      </span>

                      {/* PLATFORMS */}

                      <div className="flex items-center gap-1">
                        {platforms.map((plat) => (
                          <span
                            key={plat}
                            className="
                              px-1.5
                              py-0.5
                              rounded
                              bg-slate-100
                              border
                              border-black/8
                              lowercase
                            "
                          >
                            {plat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ICON */}

                  <div className="text-slate-600 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/*  
                    POSTS
                  */}

                {isExpanded && (
                  <div
                    className="
                      border-t
                      border-black/8
                      bg-black/[0.015]
                      px-3
                      py-3
                      flex
                      flex-col
                      gap-2
                    "
                  >
                    {cluster.posts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() =>
                          store.setSelectedPostId(
                            post.id
                          )
                        }
                        className="
                          px-3
                          py-3
                          rounded-lg
                          border
                          border-black/8
                          bg-white/60
                          hover:bg-white
                          cursor-pointer
                          transition-all
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        {/* LEFT */}

                        <div className="flex-1 min-w-0">
                          <p
                            className="
                              text-[11px]
                              text-slate-800
                              font-medium
                              line-clamp-1
                            "
                          >
                            {post.translated_content ||
                              post.content}
                          </p>

                          <div
                            className="
                              mt-1.5
                              flex
                              items-center
                              gap-2
                              text-[10px]
                              text-slate-500
                            "
                          >
                            <span className="font-semibold text-slate-700">
                              @{post.author}
                            </span>

                            <span>•</span>

                            <span className="capitalize">
                              {post.platform}
                            </span>

                            <span>•</span>

                            <span className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />

                              {new Date(
                                post.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* RIGHT */}

                        <div className="flex items-center gap-2 shrink-0">
                          {/* SENTIMENT */}

                          <span
                            className={`
                              px-2
                              h-5
                              rounded-md
                              text-[9px]
                              font-bold
                              uppercase
                              border
                              flex
                              items-center
                              ${
                                post.sentiment ===
                                'positive'
                                  ? 'bg-lime-50 text-lime-700 border-lime-200'
                                  : post.sentiment ===
                                    'negative'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }
                            `}
                          >
                            {post.sentiment}
                          </span>

                          {/* SCORE */}

                          <span
                            className="
                              px-2
                              h-5
                              rounded-md
                              bg-slate-100
                              border
                              border-black/8
                              text-[9px]
                              font-bold
                              text-slate-700
                              flex
                              items-center
                            "
                          >
                            {post.engagement_score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}