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
  Twitter,
  Youtube,
  Compass
} from 'lucide-react';

export default function Sidebar() {
  const store = useDashboardStore();

  const handlePlatformChange = (p: typeof store.platform) => {
    store.setPlatform(p);
  };

  return (
    <aside
      className="
        w-[290px]
        h-screen
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
      "
    >
      {/* =========================
          BRAND HEADER
      ========================= */}

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

      {/* =========================
          FILTER HEADER
      ========================= */}

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
          onClick={store.resetFilters}
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

      {/* =========================
          FILTERS
      ========================= */}

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
        {/* =========================
            PLATFORM
        ========================= */}

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
                    ${
                      isActive
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
                  {p === 'twitter' && <Twitter className="w-3.5 h-3.5" />}
                  {p === 'youtube' && <Youtube className="w-3.5 h-3.5" />}
                  {p === 'reddit' && (
                    <span className="text-[10px] font-bold">r/</span>
                  )}

                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================
            CATEGORY
        ========================= */}

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
            <Tag className="w-3.5 h-3.5 text-slate-700" />
            Category
          </label>

          <select
            value={store.category}
            onChange={(e) =>
              store.setCategory(e.target.value as DashboardState['category'])
            }
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

        {/* =========================
            LANGUAGE
        ========================= */}

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
            <Globe className="w-3.5 h-3.5 text-slate-700" />
            Original Language
          </label>

          <select
            value={store.language}
            onChange={(e) => store.setLanguage(e.target.value)}
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

        {/* =========================
            SENTIMENT
        ========================= */}

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
                  onClick={() => store.setSentiment(s)}
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
                    ${
                      isActive
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
                      ${
                        s === 'positive'
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

        {/* =========================
            SPAM FILTER
        ========================= */}

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
              ${
                store.isGibberish
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
                ${
                  store.isGibberish
                    ? 'translate-x-5'
                    : 'translate-x-[2px]'
                }
              `}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}