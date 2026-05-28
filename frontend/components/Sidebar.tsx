'use client';

import React from 'react';
import { useDashboardStore, type DashboardState } from '../store/useDashboardStore';
import { CATEGORIES, LANGUAGES } from '../shared';

import {
  Filter,
  RotateCcw,
  Globe,
  Tag,
  HeartHandshake,
  Layers,
  AlertOctagon,
  Compass,
  Download
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const store = useDashboardStore();

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

  const handlePlatformChange = (p: typeof store.platform) => {
    store.setPlatform(p);
    onCloseMobile?.();
  };

  return (
    <aside
      className="
        w-full
        h-full
        px-4
        py-4
        flex
        flex-col
        gap-4
        border-r
        border-black/10
        bg-white/40
        backdrop-blur-xl
        shadow-[0_4px_24px_rgba(15,23,42,0.06)]
        select-none
        overflow-y-auto
      "
    >
      {/*  
          BRAND HEADER
        */}

      <div className="flex items-center gap-3 pb-4 border-b border-black/10">
        <div
          className="
            w-11
            h-11
            rounded-lg
            bg-[#020817]
            flex
            items-center
            justify-center
            shadow-[0_4px_16px_rgba(2,8,23,0.18)]
          "
        >
          <Compass className="w-5 h-5 text-white" />
        </div>

        <div className="flex flex-col">
          <h1
            className="
              text-[1.2rem]
              leading-none
              font-bold
              tracking-tight
              text-[#020817]
            "
          >
            Zebvo Social
          </h1>

          <p
            className="
              mt-1
              text-[9px]
              font-semibold
              tracking-[0.18em]
              uppercase
              text-slate-700
            "
          >
            Intelligence Engine
          </p>
        </div>
      </div>

      {/*  
          FILTER HEADER
        */}

      <div className="flex items-center justify-between">
        <div
          className="
            flex
            items-center
            gap-1.5
            text-[11px]
            font-bold
            tracking-[0.14em]
            uppercase
            text-slate-700
          "
        >
          <Filter className="w-3.5 h-3.5 text-slate-800" />
          Filter Engine
        </div>

        <button
          onClick={() => {
            store.resetFilters();
            onCloseMobile?.();
          }}
          className="
            flex
            items-center
            gap-1
            px-2
            py-1
            rounded-md
            text-[10px]
            font-medium
            text-slate-700
            hover:bg-black/5
            transition-all
            cursor-pointer
          "
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/*  
          FILTERS
        */}

      <div
        className="
          flex
          flex-col
          gap-5
          overflow-y-auto
          pr-1
          custom-scrollbar
        "
      >
        {/*  
            PLATFORM
          */}

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
            <Layers className="w-3.5 h-3.5 text-slate-700" />
            Platform
          </label>

          <div className="grid grid-cols-2 gap-2">
            {(['twitter', 'reddit', 'youtube', 'all'] as const).map((p) => {
              const isActive = store.platform === p;

              return (
                <button
                  key={p}
                  onClick={() => handlePlatformChange(p)}
                  className={`
    h-10
    rounded-lg
    border
    flex
    items-center
    justify-center
    gap-1.5
    text-[11px]
    font-semibold
    transition-all
    cursor-pointer
    ${isActive
                      ? `
          bg-[#020817]
          text-white
          border-[#020817]
          shadow-[0_4px_14px_rgba(2,8,23,0.16)]
        `
                      : `
          bg-white/60
          text-slate-700
          border-black/8
          hover:bg-white/90
        `
                    }
  `}
                >
                  {/* TWITTER/X */}
                  {p === 'twitter' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H0.316l5.733-6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z" />
                    </svg>
                  )}

                  {/* YOUTUBE */}
                  {p === 'youtube' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="-0.145 -0.145 4 4"
                      className="w-4 h-4"
                    >
                      <g>
                        <path
                          d="M0.3021 2.40726c0.044255 0.38027500000000003 0.36040000000000005 0.67999 0.742 0.714705 0.26394 0.02385 0.53477 0.044255 0.8109000000000001 0.044255 0.27613000000000004 0 0.54696 -0.020405 0.8109000000000001 -0.044255 0.3816 -0.03445 0.6977450000000001 -0.33443 0.742 -0.714705 0.0212 -0.18073000000000003 0.03710000000000001 -0.36517 0.03710000000000001 -0.5522600000000001 0 -0.18709 -0.0159 -0.37152999999999997 -0.03710000000000001 -0.5522600000000001 -0.044255 -0.38027500000000003 -0.36040000000000005 -0.67999 -0.742 -0.714705 -0.26394 -0.02385 -0.53477 -0.044255 -0.8109000000000001 -0.044255 -0.27613000000000004 0 -0.54696 0.020405 -0.8109000000000001 0.044255 -0.3816 0.034715 -0.6977450000000001 0.33443 -0.742 0.714705A4.74615 4.74615 0 0 0 0.265 1.855c0 0.18709 0.0159 0.37152999999999997 0.03710000000000001 0.5522600000000001Z"
                          stroke="currentColor"
                          strokeWidth={0.29}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M1.79776 2.4539C2.12212 2.2800599999999998 2.5426750000000005 2.02248 2.5426750000000005 1.855c0 -0.16748000000000002 -0.420555 -0.42506000000000005 -0.744915 -0.5989 -0.17039500000000002 -0.09115999999999999 -0.369145 0.034980000000000004 -0.369145 0.228165l0 0.7414700000000001c0 0.193185 0.19875 0.319325 0.369145 0.22790000000000002Z"
                          stroke="currentColor"
                          strokeWidth={0.29}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    </svg>
                  )}

                  {/* REDDIT */}
                  {p === 'reddit' && (
                    <span className="text-[10px] font-bold">
                      r/
                    </span>
                  )}

                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/*  
            CATEGORY
          */}

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
            <Tag className="w-3.5 h-3.5 text-slate-700" />
            Category
          </label>

          <select
            value={store.category}
            onChange={(e) => {
              store.setCategory(e.target.value as DashboardState['category']);
              onCloseMobile?.();
            }}
            className="
              h-10
              px-3
              rounded-lg
              border
              border-black/8
              bg-white/60
              text-slate-800
              text-[11px]
              font-medium
              outline-none
              transition-all
              cursor-pointer
              focus:border-slate-400
              focus:bg-white
            "
          >
            <option value="all">All Categories</option>

            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/*  
            LANGUAGE
          */}

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
            <Globe className="w-3.5 h-3.5 text-slate-700" />
            Original Language
          </label>

          <select
            value={store.language}
            onChange={(e) => {
              store.setLanguage(e.target.value);
              onCloseMobile?.();
            }}
            className="
              h-10
              px-3
              rounded-lg
              border
              border-black/8
              bg-white/60
              text-slate-800
              text-[11px]
              font-medium
              outline-none
              transition-all
              cursor-pointer
              focus:border-slate-400
              focus:bg-white
            "
          >
            <option value="all">All Languages</option>

            {Object.entries(LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/*  
            SENTIMENT
          */}

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
            <HeartHandshake className="w-3.5 h-3.5 text-slate-700" />
            Sentiment
          </label>

          <div className="flex flex-col gap-2">
            {(['all', 'positive', 'neutral', 'negative'] as const).map((s) => {
              const isActive = store.sentiment === s;

              return (
                <button
                  key={s}
                  onClick={() => {
                    store.setSentiment(s);
                    onCloseMobile?.();
                  }}
                  className={`
                    h-10
                    px-3
                    rounded-lg
                    border
                    flex
                    items-center
                    justify-between
                    text-[11px]
                    font-semibold
                    transition-all
                    cursor-pointer
                    ${isActive
                      ? `
                          bg-[#020817]
                          text-white
                          border-[#020817]
                          shadow-[0_4px_14px_rgba(2,8,23,0.14)]
                        `
                      : `
                          bg-white/60
                          text-slate-700
                          border-black/8
                          hover:bg-white/90
                        `
                    }
                  `}
                >
                  <span className="capitalize">{s}</span>

                  <span
                    className={`
                      w-2.5
                      h-2.5
                      rounded-full
                      ${s === 'positive'
                        ? 'bg-lime-500'
                        : s === 'neutral'
                          ? 'bg-amber-400'
                          : s === 'negative'
                            ? 'bg-red-500'
                            : 'bg-slate-400'
                      }
                    `}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/*  
            SPAM FILTER
          */}

        <div
          className="
            pt-4
            border-t
            border-black/10
            flex
            items-center
            justify-between
          "
        >
          <div className="flex items-center gap-2.5">
            <div
              className="
                w-8
                h-8
                rounded-md
                bg-white/60
                border
                border-black/8
                flex
                items-center
                justify-center
              "
            >
              <AlertOctagon className="w-4 h-4 text-slate-700" />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-800">
                Spam Filter
              </p>

              <p className="text-[10px] text-slate-600">
                View filtered trash
              </p>
            </div>
          </div>

          <button
            onClick={() => store.setIsGibberish(!store.isGibberish)}
            className={`
              relative
              w-11
              h-6
              rounded-full
              transition-all
              cursor-pointer
              ${store.isGibberish
                ? 'bg-[#020817]'
                : 'bg-slate-300'
              }
            `}
          >
            <div
              className={`
                absolute
                top-[2px]
                w-5
                h-5
                rounded-full
                bg-white
                shadow-sm
                transition-all
                ${store.isGibberish
                  ? 'translate-x-5'
                  : 'translate-x-[2px]'
                }
              `}
            />
          </button>
        </div>

        <div className="md:hidden mt-4 pt-4 border-t border-black/10 flex flex-col gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700">
            Export data
          </div>

          <button
            onClick={handleExportCsv}
            className="
              w-full
              h-11
              rounded-lg
              border
              border-black/10
              bg-white/75
              text-slate-800
              text-[11px]
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              transition-all
              hover:bg-white
            "
          >
            <Download className="w-4 h-4" />
            CSV
          </button>

          <button
            onClick={handleExportPdf}
            className="
              w-full
              h-11
              rounded-lg
              border
              border-black/10
              bg-white/75
              text-slate-800
              text-[11px]
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              transition-all
              hover:bg-white
            "
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>
    </aside>
  );
}