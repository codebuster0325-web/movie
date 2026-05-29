import React from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus, Sparkles, Film, Users, Ticket } from "lucide-react";
import { DailyBoxOfficeItem } from "../types";

interface MovieCardProps {
  item: DailyBoxOfficeItem;
  isSelected: boolean;
  onClick: () => void;
  isDark: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, isSelected, onClick, isDark }) => {
  const rankIntenNum = parseInt(item.rankInten, 10);
  const isNew = item.rankOldAndNew === "NEW";

  const formatNumber = (numStr: string) => {
    return parseInt(numStr, 10).toLocaleString("ko-KR");
  };

  return (
    <motion.button
      id={`movie-card-${item.movieCd}`}
      onClick={onClick}
      whileHover={{ y: -2, x: -2 }}
      whileTap={{ y: 2, x: 2 }}
      className={`relative w-full text-left p-5 border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? isDark
            ? "border-amber-400 bg-amber-500/10 shadow-[4px_4px_0px_0px_#f59e0b]"
            : "border-stone-950 bg-amber-50 shadow-[4px_4px_0px_0px_#111111]"
          : isDark
            ? "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
            : "border-stone-900 bg-white hover:bg-stone-50 shadow-[3px_3px_0px_0px_rgba(28,25,23,0.9)]"
      }`}
    >
      {/* Visual Perforated Ticket Notches (Top and bottom left notches to look like a ticket stub) */}
      <div className={`absolute top-1/2 -translate-y-1/2 -left-3 w-5 h-5 rounded-full border-2 ${
        isDark ? "bg-zinc-950 border-zinc-800" : "bg-stone-100 border-stone-900"
      }`} />
      
      {/* Decorative Ticket Perforation line */}
      <div className={`absolute left-8 top-0 bottom-0 border-l-2 border-dashed ${
        isDark ? "border-zinc-800" : "border-stone-200"
      }`} />

      <div className="pl-6 flex items-start gap-4">
        {/* Left segment: Ticket Rank & Change */}
        <div className="flex flex-col items-center justify-center min-w-[2.5rem] py-1">
          <span className={`text-4xl font-black font-serif tracking-tight leading-none ${
            isSelected
              ? isDark ? "text-amber-400" : "text-stone-950"
              : isDark ? "text-zinc-500" : "text-stone-400"
          }`}>
            {item.rank.padStart(2, '0')}
          </span>
          
          <div className="flex items-center gap-0.5 mt-2">
            {isNew ? (
              <span className="flex items-center text-[8px] font-black tracking-widest text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20">
                NEW
              </span>
            ) : rankIntenNum > 0 ? (
              <span className="flex items-center text-[10px] font-black text-rose-500">
                ▲{rankIntenNum}
              </span>
            ) : rankIntenNum < 0 ? (
              <span className="flex items-center text-[10px] font-black text-blue-500">
                ▼{Math.abs(rankIntenNum)}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-stone-400 dark:text-zinc-600">
                -
              </span>
            )}
          </div>
        </div>

        {/* Right segment: Detailed Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap font-mono text-[9px] font-bold">
            <span className={`px-2 py-0.5 border ${
              isSelected 
                ? isDark ? "border-amber-400/30 text-amber-400 bg-amber-950/20" : "border-stone-950 text-stone-900 bg-stone-100"
                : isDark ? "border-zinc-800 text-zinc-400 bg-zinc-950" : "border-stone-200 text-stone-500 bg-white"
            }`}>
              {item.openDt.substring(0, 4)} RELEASE
            </span>
            <span className={`px-2 py-0.5 border ${
              isSelected 
                ? isDark ? "border-amber-400/30 text-amber-300 bg-amber-950/20" : "border-stone-950 text-stone-800 bg-amber-100"
                : isDark ? "border-zinc-800 text-zinc-500 bg-zinc-950" : "border-stone-200 text-stone-500 bg-stone-50"
            }`}>
              SHARE {item.salesShare}%
            </span>
          </div>

          <h3 className={`text-base font-black font-sans tracking-tight truncate ${
            isDark ? "text-white" : "text-stone-950"
          }`}>
            {item.movieNm}
          </h3>

          <div className="flex items-center gap-3 mt-3 text-[10px] font-mono opacity-80 border-t border-dashed dark:border-zinc-800 border-stone-100 pt-2">
            <span className={`flex items-center gap-1 leading-none ${
              isDark ? "text-zinc-400" : "text-stone-600"
            }`}>
              DAILY: <strong className={isDark ? "text-zinc-200" : "text-stone-900"}>{formatNumber(item.audiCnt)}</strong>
            </span>
            <span className={`flex items-center gap-1 leading-none ${
              isDark ? "text-zinc-400" : "text-stone-600"
            }`}>
              ACC: <strong className={isDark ? "text-zinc-200" : "text-stone-900"}>{formatNumber(item.audiAcc)}</strong>
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
