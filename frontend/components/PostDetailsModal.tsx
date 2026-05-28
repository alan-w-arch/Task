'use client';

import React, { useState } from 'react';

import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import { useDashboardStore } from '../store/useDashboardStore';

import {
  X,
  Loader2,
  Globe2,
  TrendingUp,
  Clock,
  FileText,
  MessageSquare,
  Network,
  Sparkles
} from 'lucide-react';

import type {
  Post,
  Translation,
  LanguageCode
} from '../shared';

import { LANGUAGES } from '../shared';

type PostDetailResponse = {
  post: Post;
  translations: Translation[];
  clusterSiblings: Post[];
};

export default function PostDetailsModal() {
  const store = useDashboardStore();

  const queryClient = useQueryClient();

  const [selectedLang, setSelectedLang] =
    useState<LanguageCode>('en');

  const [translatedText, setTranslatedText] =
    useState<string | null>(null);

  const postId = store.selectedPostId;

  /*  
     FETCH
    */

  const { data, isLoading, error } =
    useQuery<PostDetailResponse | null>({
      queryKey: ['post-detail', postId],

      queryFn: async () => {
        if (!postId) return null;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`
        );

        if (!response.ok) {
          throw new Error(
            'Failed to fetch post details'
          );
        }

        return response.json();
      },

      enabled: !!postId
    });

  /*  
     TRANSLATION
    */

  const translateMutation = useMutation({
    mutationFn: async (
      language: LanguageCode
    ) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/translate`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            postId,
            language
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to translate post'
        );
      }

      return response.json();
    },

    onSuccess: (resData) => {
      setTranslatedText(
        resData.translatedText
      );

      queryClient.invalidateQueries({
        queryKey: [
          'post-detail',
          postId
        ]
      });
    },

    onError: () => {
      alert(
        'Translation failed. Verify backend services.'
      );
    }
  });

  /*  
     CLOSE
    */

  if (!postId) return null;

  const handleClose = () => {
    store.setSelectedPostId(null);

    setTranslatedText(null);

    setSelectedLang('en');
  };

  /* TRANSLATE CLICK */

  const handleTranslateClick = (langCode: LanguageCode) => { setSelectedLang(langCode); setTranslatedText(null); const cached = data?.translations?.find((t) => t.language === langCode); if (cached) { setTranslatedText(cached.translated_text); } else { translateMutation.mutate(langCode); } };
  const postDetail: Post = data?.post ?? ({} as Post);

  const siblings: Post[] =
    data?.clusterSiblings ?? [];

  const cachedTranslations =
    data?.translations || [];

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        p-2
        md:p-4
        bg-black/30
        backdrop-blur-md
      "
    >
      {/*  
          MODAL - Responsive
        */}

      <div
        className="
          relative
          w-full
          max-w-2xl
          md:max-w-6xl
          max-h-[95vh]
          md:max-h-[90vh]
          overflow-hidden
          rounded-xl
          md:rounded-2xl
          border
          border-black/10
          bg-white/60
          backdrop-blur-2xl
          shadow-[0_20px_80px_rgba(15,23,42,0.18)]
          flex
          flex-col
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >
        {/*  
            CLOSE
          */}

        <button
          onClick={handleClose}
          className="
            absolute
            right-3
            md:right-5
            top-3
            md:top-5
            z-20
            w-8
            md:w-9
            h-8
            md:h-9
            rounded-lg
            border
            border-black/10
            bg-white/70
            flex
            items-center
            justify-center
            text-slate-700
            hover:bg-white
            hover:text-black
            transition-all
            cursor-pointer
          "
        >
          <X className="w-3.5 md:w-4 h-3.5 md:h-4" />
        </button>

        {/*  
            LOADING
          */}

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-10 md:p-20">
            <Loader2 className="w-6 md:w-8 h-6 md:h-8 text-slate-700 animate-spin" />
          </div>
        ) : error ? (
          /*  
              ERROR
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
              p-6
              md:p-10
            "
          >
            <p className="font-bold text-base md:text-lg">
              Failed to load details
            </p>

            <button
              onClick={handleClose}
              className="
                px-4
                py-2
                rounded-lg
                bg-[#020817]
                text-white
                text-xs
                font-semibold
                cursor-pointer
              "
            >
              Close Modal
            </button>
          </div>
        ) : (
          <>
            {/*  
                HEADER - Responsive
              */}

            <div
              className="
                px-3
                md:px-6
                py-3
                md:py-5
                border-b
                border-black/10
                bg-white/25
                backdrop-blur-xl
                flex
                flex-col
                gap-1.5
                md:gap-2
              "
            >
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                <span
                  className="
                    px-2
                    md:px-2.5
                    h-5
                    md:h-6
                    rounded-md
                    bg-[#020817]
                    text-white
                    text-[9px]
                    md:text-[10px]
                    font-bold
                    uppercase
                    flex
                    items-center
                  "
                >
                  {postDetail.platform}
                </span>

                <span
                  className="
                    text-[10px]
                    md:text-xs
                    font-bold
                    text-slate-800
                    truncate
                  "
                >
                  @{postDetail.author}
                </span>

                <span
                  className="
                    text-[9px]
                    md:text-[10px]
                    text-slate-500
                    font-medium
                    truncate
                  "
                >
                  ({postDetail.handle})
                </span>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-1
                  md:gap-1.5
                  text-[9px]
                  md:text-[11px]
                  text-slate-600
                  font-medium
                  flex-wrap
                "
              >
                <Clock className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 flex-shrink-0" />

                <span className="truncate">
                  {new Date(
                    postDetail.scraped_at
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/*  
                BODY - Responsive
              */}

            <div
              className="
                flex-1
                overflow-y-auto
                custom-scrollbar
                px-3
                md:px-6
                py-4
                md:py-6
              "
            >
              <div className="flex flex-col md:grid md:grid-cols-5 gap-4 md:gap-6">
                {/*  
                    LEFT - Full width on mobile
                  */}

                <div className="md:col-span-3 flex flex-col gap-3 md:gap-5">
                  {/* SUMMARY */}

                  {postDetail.summary && (
                    <div
                      className="
                        rounded-lg
                        md:rounded-xl
                        border
                        border-black/10
                        bg-white/50
                        backdrop-blur-xl
                        px-3
                        md:px-5
                        py-3
                        md:py-4
                        flex
                        flex-col
                        gap-2
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
                          flex
                          items-center
                          gap-1
                          md:gap-1.5
                        "
                      >
                        <Sparkles className="w-2.5 md:w-3 h-2.5 md:h-3 flex-shrink-0" />
                        Summary
                      </div>

                      <p
                        className="
                          text-[10px]
                          md:text-[12px]
                          leading-relaxed
                          text-slate-700
                          font-medium
                        "
                      >
                        {postDetail.summary}
                      </p>
                    </div>
                  )}

                  {/* CONTENT */}

                  <div
                    className="
                      rounded-lg
                      md:rounded-xl
                      border
                      border-black/10
                      bg-white/50
                      backdrop-blur-xl
                      px-3
                      md:px-5
                      py-3
                      md:py-5
                      flex
                      flex-col
                      gap-2
                      md:gap-3
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
                        flex
                        items-center
                        gap-1
                        md:gap-1.5
                      "
                    >
                      <FileText className="w-2.5 md:w-3 h-2.5 md:h-3 flex-shrink-0" />
                      Content
                    </div>

                    <div
                      className="
                        whitespace-pre-wrap
                        text-[10px]
                        md:text-[13px]
                        leading-relaxed
                        text-slate-800
                        font-medium
                        max-h-48
                        md:max-h-none
                        overflow-y-auto
                        md:overflow-visible
                      "
                    >
                      {postDetail.content}
                    </div>
                  </div>

                  {/* TRANSLATIONS */}

                  <div
                    className="
                      rounded-lg
                      md:rounded-xl
                      border
                      border-black/10
                      bg-white/50
                      backdrop-blur-xl
                      px-3
                      md:px-5
                      py-3
                      md:py-5
                      flex
                      flex-col
                      gap-3
                      md:gap-4
                    "
                  >
                    <div>
                      <div
                        className="
                          text-[9px]
                          md:text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-slate-700
                          flex
                          items-center
                          gap-1
                          md:gap-1.5
                        "
                      >
                        <Globe2 className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 flex-shrink-0" />
                        Translate
                      </div>

                      <p
                        className="
                          mt-1
                          text-[8px]
                          md:text-[10px]
                          text-slate-500
                          font-medium
                        "
                      >
                        Cached translations are reused.
                      </p>
                    </div>

                    {/* LANGS */}

                    <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5 md:gap-2">
                      {Object.entries(
                        LANGUAGES
                      ).map(([code, name]) => {
                        const isSelected =
                          selectedLang ===
                          code;

                        const isCached =
                          cachedTranslations.some(
                            (t) =>
                              t.language ===
                              code
                          );

                        return (
                          <button
                            key={code}
                            onClick={() =>
                              handleTranslateClick(
                                code as LanguageCode
                              )
                            }
                            className={`
                              h-7
                              md:h-9
                              rounded-lg
                              border
                              text-[8px]
                              md:text-[10px]
                              font-semibold
                              transition-all
                              cursor-pointer
                              ${isSelected
                                ? `
                                    bg-[#020817]
                                    text-white
                                    border-[#020817]
                                  `
                                : `
                                    bg-white/70
                                    text-slate-700
                                    border-black/10
                                    hover:bg-white
                                  `
                              }
                            `}
                          >
                            {name}

                            {isCached && (
                              <span className="ml-0.5">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* LOADING */}

                    {translateMutation.isPending && (
                      <div
                        className="
                          h-12
                          md:h-16
                          rounded-xl
                          border
                          border-black/10
                          bg-white/70
                          flex
                          items-center
                          justify-center
                          gap-2
                          text-[10px]
                          md:text-[11px]
                          text-slate-600
                          font-medium
                        "
                      >
                        <Loader2 className="w-3 md:w-4 h-3 md:h-4 animate-spin" />

                        Translating...
                      </div>
                    )}

                    {/* RESULT */}

                    {translatedText && (
                      <div
                        className="
                          rounded-xl
                          border
                          border-black/10
                          bg-white/70
                          px-3
                          md:px-4
                          py-2
                          md:py-4
                          flex
                          flex-col
                          gap-1.5
                          md:gap-2
                        "
                      >
                        <div
                          className="
                            text-[8px]
                            md:text-[10px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-700
                          "
                        >
                          Translation ({
                            LANGUAGES[
                            selectedLang
                            ]
                          })
                        </div>

                        <p
                          className="
                            text-[9px]
                            md:text-[12px]
                            leading-relaxed
                            text-slate-800
                            font-medium
                            max-h-32
                            md:max-h-none
                            overflow-y-auto
                            md:overflow-visible
                          "
                        >
                          {translatedText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/*  
                    RIGHT - Full width on mobile
                  */}

                <div className="md:col-span-2 flex flex-col gap-3 md:gap-5">
                  {/* INSIGHTS */}

                  <div
                    className="
                      rounded-lg
                      md:rounded-xl
                      border
                      border-black/10
                      bg-white/50
                      backdrop-blur-xl
                      px-3
                      md:px-5
                      py-3
                      md:py-5
                      flex
                      flex-col
                      gap-2
                      md:gap-4
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
                      "
                    >
                      Details
                    </div>

                    {/* CATEGORY */}

                    <div className="flex items-center justify-between text-[10px] md:text-[11px]">
                      <span className="text-slate-500 font-medium">
                        Category
                      </span>

                      <span
                        className="
                          px-2
                          md:px-2.5
                          h-5
                          md:h-6
                          rounded-md
                          bg-[#020817]
                          text-white
                          text-[8px]
                          md:text-[10px]
                          font-bold
                          flex
                          items-center
                          text-nowrap
                        "
                      >
                        {postDetail.category ||
                          'N/A'}
                      </span>
                    </div>

                    {/* SENTIMENT */}

                    <div className="flex items-center justify-between text-[10px] md:text-[11px]">
                      <span className="text-slate-500 font-medium">
                        Sentiment
                      </span>

                      <span
                        className={`
                          px-2
                          md:px-2.5
                          h-5
                          md:h-6
                          rounded-md
                          text-[8px]
                          md:text-[10px]
                          font-bold
                          uppercase
                          border
                          flex
                          items-center
                          text-nowrap
                          ${postDetail.sentiment ===
                            'positive'
                            ? 'bg-lime-50 text-lime-700 border-lime-200'
                            : postDetail.sentiment ===
                              'negative'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        `}
                      >
                        {postDetail.sentiment ||
                          'neutral'}
                      </span>
                    </div>

                    {/* ENGAGEMENT */}

                    <div className="flex items-center justify-between text-[10px] md:text-[11px]">
                      <span className="text-slate-500 font-medium">
                        Engagement
                      </span>

                      <span
                        className="
                          flex
                          items-center
                          gap-0.5
                          md:gap-1
                          font-bold
                          text-slate-800
                        "
                      >
                        <TrendingUp className="w-3 md:w-3.5 h-3 md:h-3.5 flex-shrink-0" />

                        {
                          postDetail.engagement_score
                        }
                      </span>
                    </div>

                    {/* LANGUAGE */}

                    <div className="flex items-center justify-between text-[10px] md:text-[11px]">
                      <span className="text-slate-500 font-medium">
                        Language
                      </span>

                      <span
                        className="
                          font-bold
                          uppercase
                          text-slate-800
                        "
                      >
                        {postDetail.language ||
                          'en'}
                      </span>
                    </div>

                    {/* REGION */}

                    {postDetail.region && (
                      <div className="flex items-center justify-between text-[10px] md:text-[11px]">
                        <span className="text-slate-500 font-medium">
                          Region
                        </span>

                        <span
                          className="
                            font-bold
                            text-slate-800
                          "
                        >
                          {postDetail.region}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SIBLINGS */}

                  <div className="flex flex-col gap-2 md:gap-3 flex-1 min-h-0">
                    <div
                      className="
                        text-[9px]
                        md:text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-700
                        flex
                        items-center
                        gap-1
                      "
                    >
                      <Network className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 flex-shrink-0" />
                      Related
                    </div>

                    {siblings.length === 0 ? (
                      <div
                        className="
                          flex-1
                          rounded-lg
                          md:rounded-xl
                          border
                          border-dashed
                          border-black/10
                          bg-white/30
                          flex
                          flex-col
                          items-center
                          justify-center
                          gap-2
                          text-slate-500
                          text-center
                          p-4
                          md:p-6
                        "
                      >
                        <MessageSquare className="w-4 md:w-6 h-4 md:h-6 text-slate-400" />

                        <p className="text-[9px] md:text-[11px] font-medium">
                          No related
                        </p>
                      </div>
                    ) : (
                      <div
                        className="
                          flex
                          flex-col
                          gap-1.5
                          md:gap-2
                          overflow-y-auto
                          max-h-48
                          md:max-h-[420px]
                          pr-1
                          custom-scrollbar
                        "
                      >
                        {siblings.slice(0, 10).map((sib) => (
                          <div
                            key={sib.id}
                            onClick={() => {
                              store.setSelectedPostId(
                                sib.id
                              );

                              setTranslatedText(
                                null
                              );

                              setSelectedLang(
                                'en'
                              );
                            }}
                            className="
                              rounded-lg
                              md:rounded-xl
                              border
                              border-black/10
                              bg-white/60
                              hover:bg-white
                              px-2
                              md:px-4
                              py-2
                              md:py-4
                              cursor-pointer
                              transition-all
                            "
                          >
                            <p
                              className="
                                text-[9px]
                                md:text-[11px]
                                leading-relaxed
                                text-slate-700
                                font-medium
                                line-clamp-2
                                md:line-clamp-3
                              "
                            >
                              {sib.content}
                            </p>

                            <div
                              className="
                                mt-1.5
                                md:mt-3
                                flex
                                items-center
                                justify-between
                                text-[8px]
                                md:text-[10px]
                              "
                            >
                              <span className="font-bold text-slate-800 truncate">
                                @{sib.author}
                              </span>

                              <span className="capitalize text-slate-500 text-nowrap ml-1">
                                {sib.platform}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/*  
                FOOTER - Responsive
              */}

            <div
              className="
                h-12
                md:h-16
                px-3
                md:px-6
                border-t
                border-black/10
                bg-white/25
                backdrop-blur-xl
                flex
                items-center
                justify-between
                gap-2
                md:gap-4
              "
            >
              <a
                href={postDetail.source_url}
                target="_blank"
                rel="noreferrer"
                className="
                  text-[9px]
                  md:text-[11px]
                  font-semibold
                  text-slate-700
                  hover:text-black
                  hover:underline
                  truncate
                  flex-1
                  min-w-0
                "
              >
                View original ↗
              </a>

              <button
                onClick={handleClose}
                className="
                  h-8
                  md:h-10
                  px-3
                  md:px-4
                  rounded-lg
                  bg-[#020817]
                  text-white
                  text-[9px]
                  md:text-[11px]
                  font-semibold
                  hover:bg-slate-800
                  transition-all
                  cursor-pointer
                  flex-shrink-0
                "
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}