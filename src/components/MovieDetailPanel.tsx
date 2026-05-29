import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  X, Film, Clock, Calendar, Globe, Award, Users, Building, Tag, Sparkles
} from "lucide-react";
import { MovieInfo } from "../types";

interface MovieDetailPanelProps {
  movie: MovieInfo | null;
  isLoading: boolean;
  onClose?: () => void;
  isDark: boolean;
}

export const MovieDetailPanel: React.FC<MovieDetailPanelProps> = ({ 
  movie, 
  isLoading, 
  onClose, 
  isDark 
}) => {
  // States for the AI Review generator
  const [kw1, setKw1] = useState("");
  const [kw2, setKw2] = useState("");
  const [kw3, setKw3] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reviewResult, setReviewResult] = useState("");
  const [reviewError, setReviewError] = useState("");

  // Reset keywords and result when the active movie changes
  React.useEffect(() => {
    if (movie) {
      setKw1("");
      setKw2("");
      setKw3("");
      setReviewResult("");
      setReviewError("");
    }
  }, [movie?.movieCd]);

  if (isLoading) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center min-h-[400px] border-2 ${
        isDark 
          ? "bg-zinc-900 border-zinc-800 text-zinc-400" 
          : "bg-white border-stone-950 text-stone-600"
      }`}>
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <Film className="w-5 h-5 absolute text-amber-500 animate-pulse" />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest">CONNECTING TO KOBIS FILM DATABASE...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-12 text-center min-h-[400px] border-2 border-dashed ${
        isDark 
          ? "bg-zinc-950/20 border-zinc-800 text-zinc-500" 
          : "bg-[#FAF8F5]/50 border-stone-400 text-stone-500"
      }`}>
        <Film className="w-10 h-10 mb-4 opacity-50 text-stone-400 dark:text-zinc-600 animate-pulse" />
        <h3 className={`text-lg font-serif font-black mb-2 ${isDark ? "text-zinc-300" : "text-stone-900"}`}>
          SELECT A TICKET FOR SPECIFICATION
        </h3>
        <p className="text-xs font-mono max-w-sm leading-relaxed opacity-80 uppercase tracking-tight">
          좌측 랭킹 일람에서 박스오피스 입장권을 선택하시면 영화 상세 프로덕션 요약과 제작진 목록이 인쇄됩니다.
        </p>

        {/* Mock visual ticket element */}
        <div className="mt-8 opacity-20 flex gap-1 font-mono text-[9px]">
          <span>||||||| | ||||| ||| ||||||| | |||||</span>
        </div>
      </div>
    );
  }

  const getWatchGradeBadgeStyle = (grade: string) => {
    if (grade.includes("전체")) {
      return "bg-green-500/10 text-green-500 border-green-500/30";
    }
    if (grade.includes("12")) {
      return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    }
    if (grade.includes("15")) {
      return "bg-orange-500/10 text-orange-500 border-orange-500/30";
    }
    if (grade.includes("18") || grade.includes("청소년")) {
      return "bg-rose-500/10 text-rose-500 border-rose-500/30";
    }
    return "bg-stone-500/10 text-stone-500 border-stone-500/30";
  };

  const handleGenerateReview = async () => {
    if (!movie) return;
    if (!kw1.trim() || !kw2.trim() || !kw3.trim()) {
      setReviewError("세 개의 키워드를 모두 채워주세요.");
      return;
    }

    setIsGenerating(true);
    setReviewError("");
    setReviewResult("");

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieNm: movie.movieNm,
          movieNmEn: movie.movieNmEn,
          directors: movie.directors,
          genres: movie.genres,
          showTm: movie.showTm,
          keywords: [kw1, kw2, kw3],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "감상평 생성에 실패했습니다.");
      }

      setReviewResult(data.review);
    } catch (err: any) {
      console.error("Failed to generate movie review:", err);
      setReviewError(err.message || "오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={`w-full border-2 overflow-hidden ${
        isDark 
          ? "bg-zinc-900 border-zinc-800 text-zinc-100 shadow-[6px_6px_0px_0px_#18181b]" 
          : "bg-[#FCFAF7] border-stone-950 text-stone-950 shadow-[6px_6px_0px_0px_#1c1917]"
      }`}
    >
      {/* Editorial stamp/title header of the ticket */}
      <div className={`p-4 border-b-2 border-stone-950 dark:border-zinc-800 flex justify-between items-center text-[10px] font-mono font-bold tracking-widest ${
        isDark ? "bg-zinc-950/80 text-zinc-400" : "bg-stone-900 text-[#FCFAF7]"
      }`}>
        <span>OFFICIAL MOVIE PASS // SPECS CERTIFIED</span>
        <span>NO. {movie.movieCd}</span>
      </div>

      {/* Title & Core metadata section */}
      <div className="p-6 md:p-8 flex items-start justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {movie.genres.map((g, idx) => (
              <span 
                key={idx} 
                className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border ${
                  isDark ? "bg-zinc-800 text-zinc-300 border-zinc-700" : "bg-white text-stone-900 border-stone-950"
                }`}
              >
                {g.genreNm}
              </span>
            ))}
            {movie.audits?.[0]?.watchGradeNm && (
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border ${getWatchGradeBadgeStyle(movie.audits[0].watchGradeNm)}`}>
                {movie.audits[0].watchGradeNm}
              </span>
            )}
          </div>

          <h2 className="text-3xl font-black font-serif leading-none tracking-tight">
            {movie.movieNm}
          </h2>
          
          {(movie.movieNmEn || movie.movieNmOg) && (
            <p className={`text-xs font-mono tracking-tight font-medium ${isDark ? "text-zinc-500" : "text-stone-500"}`}>
              {movie.movieNmEn || movie.movieNmOg}
            </p>
          )}
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className={`p-1.5 border transition-all ${
              isDark 
                ? "border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white" 
                : "border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-950"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Decorative center ticket-separation dashed line */}
      <div className={`relative ${
        isDark ? "border-t-2 border-dashed border-zinc-800" : "border-t-2 border-dashed border-stone-950"
      }`}>
        {/* Ticket punch circles on left and right */}
        <div className={`absolute -top-3.5 -left-4 w-7 h-7 rounded-full border-2 ${
          isDark ? "bg-zinc-950 border-zinc-800" : "bg-stone-100 border-stone-950"
        }`} />
        <div className={`absolute -top-3.5 -right-4 w-7 h-7 rounded-full border-2 ${
          isDark ? "bg-zinc-950 border-zinc-800" : "bg-stone-100 border-stone-950"
        }`} />
      </div>

      <div className="p-6 md:p-8 space-y-8 max-h-[580px] overflow-y-auto">
        {/* Technical Specs Metric Table (Brutalist style) */}
        <div className={`grid grid-cols-2 md:grid-cols-4 border-2 ${
          isDark ? "border-zinc-800 divide-x-2 divide-zinc-800 divide-y-2 md:divide-y-0" : "border-stone-950 divide-x-2 divide-stone-950 divide-y-2 md:divide-y-0"
        }`}>
          <div className="p-4 space-y-1 font-mono">
            <span className={`block text-[9px] font-black tracking-widest uppercase ${isDark ? "text-zinc-500" : "text-stone-500"}`}>RUNNING TIME</span>
            <div className={`flex items-baseline gap-1 font-serif text-lg font-black ${isDark ? "text-amber-400" : "text-stone-950"}`}>
              <span>{movie.showTm || "-"}</span>
              <span className="text-xs font-sans font-medium">mi</span>
            </div>
          </div>

          <div className="p-4 space-y-1 font-mono">
            <span className={`block text-[9px] font-black tracking-widest uppercase ${isDark ? "text-zinc-500" : "text-stone-500"}`}>RELEASE DATE</span>
            <div className="text-sm font-black">
              {movie.openDt ? (
                <span>
                  {movie.openDt.substring(0, 4)}.{movie.openDt.substring(4, 6)}.{movie.openDt.substring(6, 8)}
                </span>
              ) : (
                <span>TBD</span>
              )}
            </div>
          </div>

          <div className="p-4 space-y-1 font-mono">
            <span className={`block text-[9px] font-black tracking-widest uppercase ${isDark ? "text-zinc-500" : "text-stone-500"}`}>PRODUCTION</span>
            <div className="text-sm font-black truncate">
              {movie.nations?.[0]?.nationNm || "KRE"}
            </div>
          </div>

          <div className="p-4 space-y-1 font-mono">
            <span className={`block text-[9px] font-black tracking-widest uppercase ${isDark ? "text-zinc-500" : "text-stone-500"}`}>FILM TYPE</span>
            <div className="text-sm font-black uppercase">
              {movie.typeNm || "LONG"}
            </div>
          </div>
        </div>

        {/* AI Keyword Review Generator - Retro Thermal Printer Style */}
        <div className={`p-5 border-2 ${
          isDark 
            ? "border-amber-400/90 bg-zinc-950/40 text-zinc-100" 
            : "border-stone-950 bg-[#FCFAF7] text-stone-950 shadow-[4px_4px_0px_0px_#1c1917]"
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <h4 className="text-xs font-black tracking-wider font-mono uppercase">
              AI REVIEW STAMP // 감상평 자동 작성소
            </h4>
          </div>
          
          <p className="text-[11px] mb-4 opacity-80 leading-relaxed font-mono">
            원하는 세 개의 핵심 감상 키워드를 입력하시면, 인공지능이 영화 프로덕션 명세서와 인물 DB를 활용해 맞춤형 극장 감상평을 완벽하게 출력합니다.
          </p>

          {/* Quick recommendations */}
          <div className="mb-4">
            <span className="block text-[9px] font-mono font-bold mb-1.5 uppercase opacity-65">
              QUICK STAMP KEYWORDS // 추천 감상 키워드:
            </span>
            <div className="flex flex-wrap gap-1">
              {["감동눈물", "역대급연기", "스토리완벽", "충격반전", "꿀잼보장", "인생명작", "킬링타임", "황홀한영상", "몰입감최고"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (!kw1) setKw1(tag);
                    else if (!kw2) setKw2(tag);
                    else if (!kw3) setKw3(tag);
                  }}
                  className={`text-[9px] font-mono px-2 py-0.5 border cursor-pointer transition-colors ${
                    isDark 
                      ? "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-amber-400 hover:text-white" 
                      : "border-stone-300 bg-white text-stone-700 hover:border-stone-950 hover:bg-stone-50"
                  }`}
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Keyword Slot Inputs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="space-y-1">
              <label className="block text-[8px] font-mono font-black opacity-60">KEYWORD 1</label>
              <input 
                type="text" 
                placeholder="예: 감동"
                value={kw1}
                onChange={(e) => setKw1(e.target.value)}
                maxLength={10}
                className={`w-full px-2 py-1 border-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-stone-400 text-stone-950"
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[8px] font-mono font-black opacity-60">KEYWORD 2</label>
              <input 
                type="text" 
                placeholder="예: 연기력"
                value={kw2}
                onChange={(e) => setKw2(e.target.value)}
                maxLength={10}
                className={`w-full px-2 py-1 border-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-stone-400 text-stone-950"
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[8px] font-mono font-black opacity-60">KEYWORD 3</label>
              <input 
                type="text" 
                placeholder="예: 인생작"
                value={kw3}
                onChange={(e) => setKw3(e.target.value)}
                maxLength={10}
                className={`w-full px-2 py-1 border-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-stone-400 text-stone-950"
                }`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerateReview}
              disabled={isGenerating || !kw1.trim() || !kw2.trim() || !kw3.trim()}
              className={`flex-1 py-2 border-2 font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isGenerating || !kw1.trim() || !kw2.trim() || !kw3.trim()
                  ? "opacity-50 cursor-not-allowed bg-zinc-800 border-zinc-800 text-zinc-500" 
                  : isDark
                    ? "bg-amber-400 text-black border-amber-400 hover:bg-amber-300" 
                    : "bg-stone-950 text-white border-stone-950 hover:bg-stone-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? "PRINTING REVIEW..." : "WRITE AI REVIEW // 감상평 인쇄"}
            </button>
            {(kw1 || kw2 || kw3) && (
              <button
                type="button"
                onClick={() => {
                  setKw1("");
                  setKw2("");
                  setKw3("");
                }}
                className={`px-3 py-2 border-2 font-mono text-xs uppercase cursor-pointer transition-colors ${
                  isDark 
                    ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white" 
                    : "border-stone-950 bg-white hover:bg-stone-100 text-stone-950"
                }`}
              >
                RESET
              </button>
            )}
          </div>

          {/* Error Feed */}
          {reviewError && (
            <div className="mt-3 text-red-500 text-xs font-mono">
              * ER-CODE-AI: {reviewError}
            </div>
          )}

          {/* AI Output Ribbon */}
          {(isGenerating || reviewResult) && (
            <div className="mt-4 relative">
              {/* Receipt cutoff border line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] border-t-2 border-dashed ${
                isDark ? "border-zinc-800" : "border-stone-400"
              }`} />
              
              <div className={`pt-4 p-4 font-mono text-xs border ${
                isDark 
                  ? "bg-zinc-950 border-zinc-800 text-zinc-100" 
                  : "bg-stone-50 border-stone-300 text-stone-950 shadow-inner"
              }`}>
                {isGenerating ? (
                  <div className="py-5 text-center space-y-2">
                    <div className="inline-block animate-spin rounded-full h-4.5 w-4.5 border-2 border-amber-500 border-t-transparent" />
                    <p className="text-[9px] tracking-widest uppercase animate-pulse">
                      THERMAL TISSUE PRINTING AI SPEC...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-[8px] border-b pb-1 opacity-50">
                      <span>STAMP SERVICE // CO-PILOT CRITIQUE</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    {/* The generated response message */}
                    <p className="leading-relaxed whitespace-pre-line font-sans text-sm tracking-tight text-center italic py-2">
                      "{reviewResult}"
                    </p>
                    <div className="border-t pt-2 flex justify-center text-[8px] font-bold tracking-[0.2em] opacity-40">
                      <span>* GEMINI 3.5 SEAMLESS INTEGRATION *</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Directors Block */}
        <div className="space-y-3">
          <h4 className={`text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 ${
            isDark ? "text-amber-400" : "text-stone-950"
          }`}>
            <Award className="w-4 h-4 shrink-0" />
            DIRECTORS
          </h4>
          
          {movie.directors && movie.directors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {movie.directors.map((dir, idx) => (
                <div 
                  key={idx} 
                  className={`px-4 py-2.5 border-2 font-mono text-xs ${
                    isDark ? "bg-zinc-800/40 border-zinc-800" : "bg-white border-stone-950"
                  }`}
                >
                  <p className="font-bold font-sans text-sm">{dir.peopleNm}</p>
                  {dir.peopleNmEn && (
                    <p className={`text-[9px] opacity-60 mt-0.5 ${isDark ? "text-zinc-400" : "text-stone-500"}`}>{dir.peopleNmEn}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-stone-400 dark:text-zinc-500 italic">No directors listed for this title.</p>
          )}
        </div>

        {/* Cast - Beautiful Grid Block */}
        <div className="space-y-4">
          <h4 className={`text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 ${
            isDark ? "text-amber-400" : "text-stone-950"
          }`}>
            <Users className="w-4 h-4 shrink-0" />
            CAST LISTING
          </h4>
          
          {movie.actors && movie.actors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {movie.actors.slice(0, 10).map((actor, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 border-2 font-mono text-xs transition-colors duration-200 ${
                    isDark 
                      ? "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700" 
                      : "bg-white border-stone-300 hover:border-stone-950"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-sans font-bold text-sm truncate">{actor.peopleNm}</p>
                    {actor.peopleNmEn && (
                      <p className={`text-[8px] opacity-50 mt-0.5 truncate ${isDark ? "text-zinc-400" : "text-stone-500"}`}>{actor.peopleNmEn}</p>
                    )}
                  </div>
                  {actor.cast && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 border shrink-0 ${
                      isDark 
                        ? "bg-zinc-900 text-zinc-400 border-zinc-700" 
                        : "bg-stone-100 text-stone-700 border-stone-300"
                    }`}>
                      {actor.cast}
                    </span>
                  )}
                </div>
              ))}
              {movie.actors.length > 10 && (
                <div className={`col-span-full text-center py-2 text-xs font-mono font-bold tracking-tight opacity-70 ${
                  isDark ? "text-zinc-400" : "text-stone-600"
                }`}>
                  + PLUS {movie.actors.length - 10} OTHER CREDITED PERFORMERS
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs font-mono text-stone-400 dark:text-zinc-500 italic">No performers catalogued.</p>
          )}
        </div>

        {/* Companies block */}
        {movie.companys && movie.companys.length > 0 && (
          <div className={`pt-6 border-t ${isDark ? "border-zinc-800" : "border-stone-200"}`}>
            <h4 className={`text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 mb-3.5 ${
              isDark ? "text-amber-400" : "text-stone-950"
            }`}>
              <Building className="w-4 h-4 shrink-0" />
              PRODUCTION COMPANY DETAILS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
              {movie.companys.slice(0, 4).map((comp, idx) => (
                <div key={idx} className={`p-3 border flex flex-col justify-between ${
                  isDark ? "border-zinc-800/80 bg-zinc-950/20" : "border-stone-200 bg-stone-50/50"
                }`}>
                  <span className={`font-bold font-sans text-sm ${isDark ? "text-zinc-200" : "text-stone-900"}`}>
                    {comp.companyNm}
                  </span>
                  <span className={`text-[9px] mt-1.5 tracking-widest font-black uppercase opacity-60`}>
                    // {comp.companyPartNm}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barcode & Decorative Ticket Footer matching the Pinterest illustration styles */}
        <div className={`pt-6 mt-4 border-t-2 border-dashed flex flex-col items-center gap-2 ${
          isDark ? "border-zinc-800" : "border-stone-950"
        }`}>
          {/* Aesthetic Barcode */}
          <div className={`h-12 w-full max-w-sm flex items-end justify-center gap-[1px] opacity-75 ${
            isDark ? "text-zinc-400" : "text-stone-950"
          }`} style={{ letterSpacing: '-0.1em' }}>
            <div className="w-1.5 h-full bg-current" />
            <div className="w-[1px] h-full bg-current" />
            <div className="w-1 h-full bg-current" />
            <div className="w-0.5 h-full bg-current" />
            <div className="w-2 h-full bg-current" />
            <div className="w-[1px] h-full bg-current" />
            <div className="w-0.5 h-full bg-current" />
            <div className="w-1.5 h-full bg-current" />
            <div className="w-1 h-full bg-current" />
            <div className="w-2.5 h-full bg-current" />
            <div className="w-[1px] h-full bg-current" />
            <div className="w-1.5 h-full bg-current" />
            <div className="w-0.5 h-full bg-current" />
            <div className="w-1 h-full bg-current" />
            <div className="w-2.5 h-full bg-current" />
            <div className="w-1.5 h-full bg-current" />
            <div className="w-[1px] h-full bg-current" />
            <div className="w-1.5 h-full bg-current" />
            <div className="w-0.5 h-full bg-current" />
            <div className="w-2 h-full bg-current" />
          </div>
          <span className="text-[9px] font-mono tracking-[0.2em] font-bold opacity-60">
            * KOBIS-{movie.movieCd} *
          </span>
        </div>

      </div>
    </motion.div>
  );
};
