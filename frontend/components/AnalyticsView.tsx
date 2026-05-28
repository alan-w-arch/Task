'use client';

import React from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

import {
  Loader2,
  TrendingUp,
  Users,
  ShieldCheck,
  Trash2,
  Award,
  Sparkles
} from 'lucide-react';

type AnalyticsResponse = {
  kpis?: {
    totalPosts: number;
    spamPosts: number;
    cleanPosts: number;
    avgEngagement: number;
  };

  sentiment?: {
    positive: number;
    neutral: number;
    negative: number;
  };

  platforms?: {
    reddit: number;
    youtube: number;
    twitter: number;
  };

  categories?: Array<{
    category: string;
    count: number;
  }>;

  trends?: Array<{
    date: string;
    posts: number;
    engagement: number;
  }>;

  trendingTopics?: Array<{
    id: string;
    name: string;
    posts: number;
    engagement: number;
  }>;
};

export default function AnalyticsView() {
  const { data, isLoading, error } =
    useQuery<AnalyticsResponse>({
      queryKey: ['analytics'],

      queryFn: async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/analytics`
        );

        if (!response.ok) {
          throw new Error(
            'Failed to fetch analytics'
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
          Error loading analytics
        </p>

        <p className="text-xs">
          Verify backend service is running.
        </p>
      </div>
    );
  }

  /*  
     KPI DATA
    */

  const kpis = data?.kpis || {
    totalPosts: 0,
    spamPosts: 0,
    cleanPosts: 0,
    avgEngagement: 0
  };

  /*  
     SENTIMENT DATA
    */

  const sentimentData = [
    {
      name: 'Positive',
      value: data?.sentiment?.positive || 0,
      color: '#84cc16'
    },
    {
      name: 'Neutral',
      value: data?.sentiment?.neutral || 0,
      color: '#f59e0b'
    },
    {
      name: 'Negative',
      value: data?.sentiment?.negative || 0,
      color: '#ef4444'
    }
  ].filter((item) => item.value > 0);

  /*  
     PLATFORM DATA
    */

  const platformData = [
    {
      name: 'Reddit',
      value: data?.platforms?.reddit || 0,
      color: '#f97316'
    },

    {
      name: 'YouTube',
      value: data?.platforms?.youtube || 0,
      color: '#ef4444'
    },

    {
      name: 'Twitter/X',
      value: data?.platforms?.twitter || 0,
      color: '#0ea5e9'
    }
  ].filter((item) => item.value > 0);

  const categoriesData =
    data?.categories || [];

  const trendsData =
    data?.trends || [];

  const trendingTopics =
    data?.trendingTopics || [];

  return (
    <div
      className="
        flex-1
        overflow-y-auto
        px-5
        py-5
        flex
        flex-col
        gap-5
        custom-scrollbar
      "
    >
      {/*  
          KPI GRID
        */}

      <div className="grid grid-cols-4 gap-4">
        {/* CLEAN */}

        <div
          className="
            rounded-xl
            border
            border-black/10
            bg-white/45
            backdrop-blur-xl
            px-4
            py-4
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              w-11
              h-11
              rounded-lg
              bg-[#020817]
              text-white
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div>
            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              Processed
            </div>

            <div
              className="
                text-2xl
                font-black
                text-slate-900
                mt-1
              "
            >
              {kpis.cleanPosts}
            </div>

            <div
              className="
                text-[10px]
                text-slate-500
                mt-0.5
              "
            >
              Clean posts indexed
            </div>
          </div>
        </div>

        {/* ENGAGEMENT */}

        <div
          className="
            rounded-xl
            border
            border-black/10
            bg-white/45
            backdrop-blur-xl
            px-4
            py-4
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              w-11
              h-11
              rounded-lg
              bg-[#020817]
              text-white
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <TrendingUp className="w-5 h-5" />
          </div>

          <div>
            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              Avg Engagement
            </div>

            <div
              className="
                text-2xl
                font-black
                text-slate-900
                mt-1
              "
            >
              {kpis.avgEngagement}
            </div>

            <div
              className="
                text-[10px]
                text-slate-500
                mt-0.5
              "
            >
              Cross-platform score
            </div>
          </div>
        </div>

        {/* SPAM */}

        <div
          className="
            rounded-xl
            border
            border-black/10
            bg-white/45
            backdrop-blur-xl
            px-4
            py-4
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              w-11
              h-11
              rounded-lg
              bg-[#020817]
              text-white
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <Trash2 className="w-5 h-5" />
          </div>

          <div>
            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              Spam Blocked
            </div>

            <div
              className="
                text-2xl
                font-black
                text-slate-900
                mt-1
              "
            >
              {kpis.spamPosts}
            </div>

            <div
              className="
                text-[10px]
                text-slate-500
                mt-0.5
              "
            >
              Gibberish filtered
            </div>
          </div>
        </div>

        {/* TOTAL */}

        <div
          className="
            rounded-xl
            border
            border-black/10
            bg-white/45
            backdrop-blur-xl
            px-4
            py-4
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              w-11
              h-11
              rounded-lg
              bg-[#020817]
              text-white
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <Users className="w-5 h-5" />
          </div>

          <div>
            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              Total Scraped
            </div>

            <div
              className="
                text-2xl
                font-black
                text-slate-900
                mt-1
              "
            >
              {kpis.totalPosts}
            </div>

            <div
              className="
                text-[10px]
                text-slate-500
                mt-0.5
              "
            >
              Posts ingested
            </div>
          </div>
        </div>
      </div>

      {/*  
          CHARTS
        */}

      <div className="grid grid-cols-3 gap-5">
        {/* SENTIMENT */}

        <div
          className="
            rounded-xl
            border
            border-black/10
            bg-white/45
            backdrop-blur-xl
            p-4
            flex
            flex-col
            gap-4
          "
        >
          <h3
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-wide
              text-slate-700
            "
          >
            Sentiment Bias
          </h3>

          <div className="h-60">
            {sentimentData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sentimentData.map(
                      (entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.color}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="
                  h-full
                  flex
                  items-center
                  justify-center
                  text-[11px]
                  text-slate-500
                "
              >
                No sentiment data
              </div>
            )}
          </div>
        </div>

        {/* PLATFORM */}

        <div
          className="
            rounded-xl
            border
            border-black/10
            bg-white/45
            backdrop-blur-xl
            p-4
            flex
            flex-col
            gap-4
          "
        >
          <h3
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-wide
              text-slate-700
            "
          >
            Platform Share
          </h3>

          <div className="h-60">
            {platformData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    outerRadius={82}
                    labelLine={false}
                    dataKey="value"
                  >
                    {platformData.map(
                      (entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.color}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="
                  h-full
                  flex
                  items-center
                  justify-center
                  text-[11px]
                  text-slate-500
                "
              >
                No platform data
              </div>
            )}
          </div>
        </div>

        {/* CATEGORIES */}

        <div
          className="
            rounded-xl
            border
            border-black/10
            bg-white/45
            backdrop-blur-xl
            p-4
            flex
            flex-col
            gap-4
          "
        >
          <h3
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-wide
              text-slate-700
            "
          >
            Top Categories
          </h3>

          <div className="h-60">
            {categoriesData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={categoriesData.slice(
                    0,
                    5
                  )}
                  layout="vertical"
                >
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                  />

                  <YAxis
                    dataKey="category"
                    type="category"
                    stroke="#64748b"
                    fontSize={10}
                    width={80}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#020817"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="
                  h-full
                  flex
                  items-center
                  justify-center
                  text-[11px]
                  text-slate-500
                "
              >
                No category data
              </div>
            )}
          </div>
        </div>
      </div>

      {/*  
          LOWER GRID
        */}

      <div className="grid grid-cols-3 gap-5">
        {/* TRENDS */}

        <div
          className="
            col-span-2
            rounded-xl
            border
            border-black/10
            bg-white/45
            backdrop-blur-xl
            p-4
            flex
            flex-col
            gap-4
          "
        >
          <h3
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-wide
              text-slate-700
            "
          >
            Volume & Engagement Trends
          </h3>

          <div className="h-72">
            {trendsData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={trendsData}>
                  <defs>
                    <linearGradient
                      id="colorPosts"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#020817"
                        stopOpacity={0.18}
                      />

                      <stop
                        offset="95%"
                        stopColor="#020817"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#cbd5e1"
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                  />

                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Legend
                    verticalAlign="top"
                    height={30}
                    iconType="circle"
                  />

                  <Area
                    name="Posts Volume"
                    type="monotone"
                    dataKey="posts"
                    stroke="#020817"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPosts)"
                  />

                  <Line
                    name="Avg Engagement"
                    type="monotone"
                    dataKey="engagement"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="
                  h-full
                  flex
                  items-center
                  justify-center
                  text-[11px]
                  text-slate-500
                "
              >
                Collect more data to visualize
                trends.
              </div>
            )}
          </div>
        </div>

        {/* TRENDING */}

        <div
          className="
            rounded-xl
            border
            border-black/10
            bg-white/45
            backdrop-blur-xl
            p-4
            flex
            flex-col
            gap-4
          "
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-800" />

            <h3
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-wide
                text-slate-700
              "
            >
              Trending Issues
            </h3>
          </div>

          <div
            className="
              flex
              flex-col
              gap-2
              overflow-y-auto
              max-h-72
              pr-1
              custom-scrollbar
            "
          >
            {trendingTopics.length > 0 ? (
              trendingTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="
                    rounded-lg
                    border
                    border-black/10
                    bg-white/60
                    hover:bg-white
                    px-3
                    py-3
                    flex
                    items-center
                    justify-between
                    gap-3
                    transition-all
                  "
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <div
                      className="
                        w-7
                        h-7
                        rounded-md
                        bg-[#020817]
                        flex
                        items-center
                        justify-center
                        shrink-0
                      "
                    >
                      <Award className="w-3.5 h-3.5 text-white" />
                    </div>

                    <div className="min-w-0">
                      <div
                        className="
                          text-[11px]
                          font-bold
                          text-slate-900
                          truncate
                        "
                      >
                        {topic.name}
                      </div>

                      <div
                        className="
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-slate-500
                          mt-1
                        "
                      >
                        {topic.posts} duplicate
                        occurrences
                      </div>
                    </div>
                  </div>

                  <div
                    className="
                      text-[10px]
                      font-black
                      text-slate-900
                      shrink-0
                    "
                  >
                    ★ {topic.engagement}
                  </div>
                </div>
              ))
            ) : (
              <div
                className="
                  flex
                  items-center
                  justify-center
                  py-16
                  text-[11px]
                  text-slate-500
                "
              >
                No active threads
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}