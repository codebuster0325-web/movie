import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Film, Calendar, Sun, Moon, AlertCircle, Sparkles, ChevronRight, 
  HelpCircle, RefreshCw, Trophy, Flame
} from "lucide-react";
import { MovieCard } from "./components/MovieCard";
import { MovieDetailPanel } from "./components/MovieDetailPanel";
import { DailyBoxOfficeItem, MovieInfo, BoxOfficeResponse, MovieResponse } from "./types";

// Dynamic yesterday calculator for date limits
const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yyyy = yesterday.getFullYear();
  const mm = String(yesterday.getMonth() + 1).padStart(2, "0");
  const dd = String(yesterday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function App() {
  const yesterdayStr = getYesterdayString();
  
  // State variables
  const [selectedDate, setSelectedDate] = useState<string>(yesterdayStr);
  const [movies, setMovies] = useState<DailyBoxOfficeItem[]>([]);
  const [selectedMovieCd, setSelectedMovieCd] = useState<string | null>(null);
  const [selectedMovieDetail, setSelectedMovieDetail] = useState<MovieInfo | null>(null);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true); // Default to a cinematic dark mode

  // Fetch daily box office list when date changes
  useEffect(() => {
    const fetchBoxOffice = async () => {
      setIsLoadingList(true);
      setErrorMessage(null);
      const apiDate = selectedDate.replace(/-/g, ""); // Convert YYYY-MM-DD to YYYYMMDD
      
      try {
        const response = await fetch(`/api/boxoffice?date=${apiDate}`);
        if (!response.ok) {
          throw new Error("서버에서 박스오피스 데이터를 가져오는데 실패했습니다.");
        }
        
        const data: BoxOfficeResponse = await response.json();
        
        if (data.faultInfo) {
          throw new Error(data.faultInfo.message || "오류가 발생했습니다.");
        }
        
        const list = data.boxOfficeResult?.dailyBoxOfficeList || [];
        setMovies(list);
        
        // Auto-select the #1 ranked movie if records exist
        if (list.length > 0) {
          setSelectedMovieCd(list[0].movieCd);
        } else {
          setSelectedMovieCd(null);
          setSelectedMovieDetail(null);
        }
      } catch (error: any) {
        console.error("Box office fetch error:", error);
        setErrorMessage(error.message || "데이터를 불러오는 동안 오류가 발생했습니다.");
        setMovies([]);
        setSelectedMovieCd(null);
        setSelectedMovieDetail(null);
      } finally {
        setIsLoadingList(false);
      }
    };
    
    fetchBoxOffice();
  }, [selectedDate]);

  // Fetch movie details when selected movie code changes
  useEffect(() => {
    if (!selectedMovieCd) {
      setSelectedMovieDetail(null);
      return;
    }

    const fetchMovieDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const response = await fetch(`/api/movie?movieCd=${selectedMovieCd}`);
        if (!response.ok) {
          throw new Error("서버에서 영화 상세 정보를 가져오는데 실패했습니다.");
        }
        
        const data: MovieResponse = await response.json();
        if (data.faultInfo) {
          throw new Error(data.faultInfo.message || "상세 정보 조회 중 오류가 발생했습니다.");
        }
        
        if (data.movieInfoResult?.movieInfo) {
          setSelectedMovieDetail(data.movieInfoResult.movieInfo);
        } else {
          setSelectedMovieDetail(null);
        }
      } catch (error: any) {
        console.error("Movie detail fetch error:", error);
        setSelectedMovieDetail(null);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchMovieDetail();
  }, [selectedMovieCd]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleRefresh = () => {
    // Re-trigger the fetch
    const current = selectedDate;
    setSelectedDate("");
    setTimeout(() => setSelectedDate(current), 50);
  };

  return (
    <div className={`transition-colors duration-300 min-h-screen font-sans ${
      isDark ? "bg-[#0A0A09] text-zinc-100" : "bg-[#FAF7F2] text-stone-950"
    }`}>
      {/* Editorial top thick stripe */}
      <div className={`h-2 w-full ${isDark ? "bg-amber-500" : "bg-stone-950"}`} />

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation & Utilities Header */}
        <header className={`flex flex-col md:flex-row md:items-center md:justify-between gap-5 p-6 border-2 transition-colors duration-200 ${
          isDark 
            ? "bg-zinc-900 border-zinc-800 text-white shadow-[4px_4px_0px_0px_#1c1917]" 
            : "bg-white border-stone-950 text-stone-950 shadow-[4px_4px_0px_0px_#1c1917]"
        }`}>
          {/* Brand/Logo Title */}
          <div className="flex items-center gap-3.5">
            <div className={`flex items-center justify-center w-12 h-12 border-2 ${
              isDark ? "bg-amber-400 border-amber-400 text-black" : "bg-stone-950 border-stone-950 text-[#FAF7F2]"
            }`}>
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black font-serif tracking-tight uppercase leading-none">
                  KOBIS CINEMA PASS
                </h1>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border ${
                  isDark ? "border-amber-400/30 text-amber-400 bg-amber-950/20" : "border-stone-950 text-stone-950 bg-stone-100"
                }`}>
                  PRO PROXY
                </span>
              </div>
              <p className={`text-[10px] font-mono uppercase tracking-wider mt-1 ${isDark ? "text-zinc-500" : "text-stone-500"}`}>
                korean film council daily archive database
              </p>
            </div>
          </div>

          {/* Controls: Date Picker & Theme Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Real date constraints */}
            <div className="relative flex items-center">
              <span className={`absolute left-3.5 ${isDark ? "text-zinc-400" : "text-stone-500"}`}>
                <Calendar className="w-4 h-4" />
              </span>
              <input 
                id="box-office-date-picker"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                max={yesterdayStr}
                required
                className={`pl-10 pr-4 py-2 border-2 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all ${
                  isDark 
                    ? "bg-zinc-950 border-zinc-800 text-white fill-white [color-scheme:dark]" 
                    : "bg-white border-stone-950 text-stone-950 [color-scheme:light]"
                }`}
              />
            </div>

            {/* Force Refresh Button */}
            <button
              onClick={handleRefresh}
              title="다시 불러오기"
              className={`p-2 border-2 transition-all cursor-pointer ${
                isDark 
                  ? "bg-zinc-950 border-zinc-800 hover:bg-zinc-800 text-zinc-300" 
                  : "bg-white border-stone-950 hover:bg-stone-50 text-stone-950"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingList ? "animate-spin" : ""}`} />
            </button>

            {/* Dark & Light Theme Switcher */}
            <button
              id="theme-toggle-btn"
              onClick={() => setIsDark(!isDark)}
              className={`p-2 border-2 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-black uppercase ${
                isDark 
                  ? "bg-zinc-950 border-zinc-800 hover:bg-zinc-800 text-zinc-200" 
                  : "bg-stone-950 border-stone-950 hover:bg-stone-800 text-white"
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">LIGHT</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#FAF7F2]" />
                  <span className="hidden sm:inline">CINEMATIC</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Informative Toast Alert */}
        <div className={`p-4 border-2 flex items-start gap-3 text-xs font-mono tracking-tight leading-relaxed ${
          isDark 
            ? "bg-zinc-900/30 border-zinc-800 text-zinc-300" 
            : "bg-[#FFF]/80 border-stone-950 text-stone-900 shadow-[3px_3px_0px_0px_#1c1917]"
        }`}>
          <Sparkles className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <div>
            <strong>조회 제한 안내 (ARCHIVE CONSTRAINTS):</strong> 영진위 API는 전일 정산 완료 데이터를 기본 수집하므로, <strong>오늘날짜 이전 데이터({yesterdayStr} 이전)</strong>만 출력하도록 제한되어 있습니다.
          </div>
        </div>

        {/* Error State */}
        {errorMessage && (
          <div className="p-6 border-2 border-rose-500 bg-rose-500/10 text-rose-500 flex items-start gap-4 shadow-[4px_4px_0px_0px_#ef4444]">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-black uppercase font-mono mb-1">데이터 조회 오류</h3>
              <p className="text-xs font-mono opacity-90">{errorMessage}</p>
              <button 
                onClick={handleRefresh}
                className="mt-3 px-4 py-1.5 border-2 border-rose-600 bg-rose-500 text-white text-xs font-black uppercase hover:bg-rose-600 transition"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* Content Explorer Grid */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Movies daily rankings list */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-stone-950 dark:border-zinc-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h2 className="text-xs font-black uppercase tracking-wider font-mono">
                  박스오피스 TOP 10
                </h2>
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase ${isDark ? "text-zinc-500" : "text-stone-500"}`}>
                DATE: {selectedDate.replace(/-/g, "/")}
              </span>
            </div>

            {isLoadingList ? (
              // Loading list skeletons
              <div className="space-y-3">
                {[...Array(6)].map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-[96px] border-2 animate-pulse ${
                      isDark ? "bg-zinc-900/30 border-zinc-800" : "bg-white border-stone-200"
                    }`}
                  />
                ))}
              </div>
            ) : movies.length > 0 ? (
              <div className="space-y-3">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.movieCd}
                    item={movie}
                    isSelected={selectedMovieCd === movie.movieCd}
                    onClick={() => setSelectedMovieCd(movie.movieCd)}
                    isDark={isDark}
                  />
                ))}
              </div>
            ) : (
              !errorMessage && (
                <div className={`text-center py-16 border-2 border-dashed ${
                  isDark ? "border-zinc-800 bg-zinc-900/10 text-zinc-500" : "border-stone-400 bg-white text-stone-500"
                }`}>
                  <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-500" />
                  <p className="text-sm font-mono font-bold uppercase">NO ARCHIVES RETRIEVED</p>
                  <p className="text-xs font-mono opacity-75 mt-1 text-stone-500 dark:text-zinc-500">다른 일자를 선택해보세요.</p>
                </div>
              )
            )}
          </div>

          {/* Right Column: Dynamic Movie Detail View */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8 lg:sticky lg:top-8">
            <div className="lg:mb-3 flex items-center border-b-2 border-stone-950 dark:border-zinc-800 pb-2">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider font-mono text-stone-950 dark:text-zinc-400">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                SPECIFICATION SHEET (KOBIS REALTIME TARGET)
              </span>
            </div>
            
            <AnimatePresence mode="wait">
              <MovieDetailPanel
                key={selectedMovieCd || "empty"}
                movie={selectedMovieDetail}
                isLoading={isLoadingDetail}
                onClose={selectedMovieCd ? () => {
                  setSelectedMovieCd(null);
                  setSelectedMovieDetail(null);
                } : undefined}
                isDark={isDark}
              />
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
