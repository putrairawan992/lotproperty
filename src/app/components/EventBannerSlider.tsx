import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";
import Card from "./Card";
import SwipeCarouselZone from "./SwipeCarouselZone";
import { T, Page } from "../types";
import { EVENT_DATA, formatEventPeriod, EventItem } from "../appData";

const AUTO_PLAY_MS = 5000;

interface EventBannerSliderProps {
  isDark: boolean;
  onNav: (p: Page) => void;
  events?: EventItem[];
  onEventDetail?: (eventId: string) => void;
}

function EventBannerSlide({
  event,
  isDark,
  onNav,
  onEventDetail,
}: {
  event: EventItem;
  isDark: boolean;
  onNav: (p: Page) => void;
  onEventDetail?: (eventId: string) => void;
}) {
  const period = formatEventPeriod(event.start, event.end);
  const xpFormatted = event.xpPool.toLocaleString("id-ID");

  // A custom-uploaded banner already carries its own full design (title, dates,
  // checklist, etc. baked into the image) — overlaying a SECOND title/tagline
  // on top of it (the old sm+ design) just duplicated the same text and made
  // it unreadable. So at every breakpoint: image in normal flow (nothing drawn
  // on top of it except the small corner ribbon), then Periode/XP badges and
  // the CTA sit BELOW it — same structure as mobile, just roomier on desktop.
  const hasCustomBanner = Boolean(event.banner);

  if (hasCustomBanner) {
    return (
      <Card
        className="overflow-hidden shadow-md event-banner p-0"
        style={{
          borderColor: isDark ? "#C8922A35" : "#E8A50035",
          background: isDark
            ? "linear-gradient(135deg, #170E08 0%, #100C16 100%)"
            : "linear-gradient(135deg, #FFF9F2 0%, #F5F7FA 100%)",
        }}
      >
        <div className="relative">
          <img src={event.banner} alt={event.title} className="w-full h-auto object-contain block" />
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#E53E3E] text-white px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-extrabold uppercase rounded-lg -rotate-6 transform shadow-md tracking-wider">
            SPESIAL EVENT
          </div>
        </div>

        <div className="p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 sm:flex-none flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border bg-card/60 min-w-0" style={{ borderColor: T.border }}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: T.text3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div className="min-w-0">
                <p style={{ fontSize: 7, color: T.text3, textTransform: "uppercase", lineHeight: 1 }}>Periode</p>
                <p className="font-bold text-[10px] sm:text-xs leading-tight truncate" style={{ color: T.text1 }}>{period}</p>
              </div>
            </div>

            <div className="flex-1 sm:flex-none flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border bg-card/60 min-w-0" style={{ borderColor: T.border }}>
              <span className="text-[9px] sm:text-[10px] font-black text-[#E8A500] flex-shrink-0" style={{ fontFamily: "var(--font-display)" }}>XP</span>
              <div className="min-w-0">
                <p style={{ fontSize: 7, color: T.text3, textTransform: "uppercase", lineHeight: 1 }}>Hadiah</p>
                <p className="font-bold text-[10px] sm:text-xs leading-tight truncate text-[#E8A500]">{xpFormatted} XP</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onEventDetail ? onEventDetail(event.id) : onNav("event")}
            className="w-full sm:w-auto sm:ml-auto px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#E8A500] hover:bg-[#CC9200] text-black transition-all shadow-md active:scale-95 flex-shrink-0"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Lihat Detail <ChevronRight size={14} />
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="p-3.5 sm:p-5 overflow-hidden relative min-h-[140px] sm:min-h-[220px] md:min-h-[260px] flex flex-col justify-between shadow-md event-banner"
      style={{
        borderColor: isDark ? "#C8922A35" : "#E8A50035",
        background: isDark
          ? "linear-gradient(135deg, #170E08 0%, #100C16 100%)"
          : "linear-gradient(135deg, #FFF9F2 0%, #F5F7FA 100%)",
      }}
    >
      <div className="absolute top-2 left-2 bg-[#E53E3E] text-white px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-lg -rotate-6 transform shadow-md z-20 tracking-wider">
        SPESIAL EVENT
      </div>

      {!event.banner && (
        <div className="absolute left-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-10 md:opacity-20 z-0">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 C30 10, 60 -10, 100 0 L100 30 C60 20, 30 40, 0 30 Z" fill={event.accentColor} />
            <path d="M0 30 C30 40, 60 20, 100 30 L100 60 C60 50, 30 70, 0 60 Z" fill="#FFFFFF" opacity="0.8" />
          </svg>
        </div>
      )}

      <div className="absolute right-4 bottom-0 top-4 w-1/2 hidden sm:flex items-center justify-end gap-6 z-10 pointer-events-none">
        <div className="flex flex-col items-center flex-shrink-0 text-center">
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl border-2 border-[#C8922A] bg-gradient-to-b from-[#2D1F08] to-[#15120D] rotate-45 scale-90 shadow-lg" />
            <div className="absolute inset-2 rounded-2xl border border-[#E8A500]/40 rotate-45 scale-90" />
            <div className="relative z-10 text-[#E8A500] flex flex-col items-center justify-center">
              <div className="flex items-center justify-center p-1.5 md:p-2 rounded-full bg-[#E8A500]/10 border border-[#E8A500]/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  <circle cx="9" cy="12" r="3" />
                </svg>
              </div>
            </div>
            <div
              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-white px-2 py-0.5 text-[8px] font-bold uppercase rounded shadow-md border border-red-400/20 whitespace-nowrap z-20 max-w-[80px] truncate"
              style={{ backgroundColor: event.accentColor }}
            >
              {event.badge.toUpperCase()}
            </div>
          </div>
          <p className="mt-1 text-[8px] md:text-[9px] font-bold uppercase tracking-wider" style={{ color: T.text3 }}>
            BADGE EKSKLUSIF
          </p>
        </div>

        <div className="w-36 h-full relative">
          <svg width="100%" height="100%" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 right-0">
            <line x1="20" y1="120" x2="75" y2="20" stroke="#4A5568" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M75 20 C85 22, 95 12, 105 18 L100 38 C90 32, 85 42, 75 36 Z" fill="#E53E3E" />
            <path d="M75 36 C85 42, 90 32, 100 38 L95 54 C85 48, 80 58, 75 52 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
            <path d="M15 120 C15 105, 18 95, 25 85 C30 75, 28 72, 28 68 C28 64, 31 62, 34 62 C37 62, 40 64, 40 68 C40 72, 36 75, 40 85 C44 95, 48 105, 50 120 Z" fill={isDark ? "#100C16" : "#2D3748"} opacity="0.9" />
            <path d="M28 80 L52 48 L56 51 L32 83 Z" fill={isDark ? "#100C16" : "#2D3748"} opacity="0.9" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between mt-2 sm:mt-6">
        <div>
          <p className="font-extrabold tracking-wider text-[8px] sm:text-[11px] md:text-xs mb-0.5" style={{ color: T.text3, letterSpacing: "0.08em" }}>
            {event.subtitle}
          </p>
          <h3
            className="font-black text-lg sm:text-2xl md:text-3xl italic uppercase tracking-wide leading-none mb-1 sm:mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: event.accentColor,
              textShadow: isDark ? `0 2px 10px ${event.accentColor}4D` : "none",
            }}
          >
            {event.heading}
          </h3>
          <p className="text-[10px] sm:text-xs md:text-sm max-w-[90%] sm:max-w-[50%] mb-2 sm:mb-4" style={{ color: T.text2, lineHeight: 1.25 }}>
            {event.tagline}{" "}
            {event.taglineHighlight && (
              <strong className="text-[#E8A500]">{event.taglineHighlight}</strong>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border bg-card/60 backdrop-blur-sm" style={{ borderColor: T.border }}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: T.text3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div className="text-left">
                <p style={{ fontSize: 7, color: T.text3, textTransform: "uppercase", lineHeight: 1 }}>Periode</p>
                <p className="font-bold text-[9px] sm:text-[10px] md:text-xs leading-tight" style={{ color: T.text1 }}>{period}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border bg-card/60 backdrop-blur-sm" style={{ borderColor: T.border }}>
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-lg bg-[#E8A500]/10 border border-[#E8A500]/20 flex-shrink-0">
                <span className="text-[7px] sm:text-[9px] font-black text-[#E8A500]" style={{ fontFamily: "var(--font-display)" }}>XP</span>
              </div>
              <div className="text-left">
                <p style={{ fontSize: 7, color: T.text3, textTransform: "uppercase", lineHeight: 1 }}>Hadiah</p>
                <p className="font-bold text-[9px] sm:text-[10px] md:text-xs leading-tight text-[#E8A500]">{xpFormatted} XP</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onEventDetail ? onEventDetail(event.id) : onNav("event")}
            className="w-full sm:w-auto mt-2 sm:mt-0 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#E8A500] hover:bg-[#CC9200] text-black transition-all shadow-md active:scale-95"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Lihat Detail <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function EventBannerSlider({ isDark, onNav, events = EVENT_DATA, onEventDetail }: EventBannerSliderProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const goTo = useCallback((index: number) => {
    if (!events || events.length === 0) return;
    setCurrent(index % events.length);
  }, [events]);

  const next = useCallback(() => {
    if (!events || events.length === 0) return;
    setCurrent((prev) => (prev + 1) % events.length);
  }, [events]);

  const prev = useCallback(() => {
    if (!events || events.length === 0) return;
    setCurrent((prev) => (prev - 1 + events.length) % events.length);
  }, [events]);

  const resetAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!events || events.length === 0) return;
    timerRef.current = setInterval(next, AUTO_PLAY_MS);
  }, [next, events]);

  useEffect(() => {
    if (!events || events.length === 0) return;
    resetAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetAutoplay, events]);

  const handlePrev = useCallback(() => {
    prev();
    resetAutoplay();
  }, [prev, resetAutoplay]);

  const handleNext = useCallback(() => {
    next();
    resetAutoplay();
  }, [next, resetAutoplay]);

  if (!events || events.length === 0) {
    return (
      <Card
        className="p-3.5 sm:p-5 overflow-hidden relative min-h-[170px] sm:min-h-[220px] md:min-h-[260px] flex flex-col justify-between shadow-md event-banner"
        style={{
          borderColor: isDark ? "rgba(232, 165, 0, 0.2)" : "rgba(232, 165, 0, 0.3)",
          background: isDark
            ? "linear-gradient(135deg, #1A1208 0%, #0F0914 100%)"
            : "linear-gradient(135deg, #FFFDF9 0%, #F5F7FA 100%)",
        }}
      >
        {/* Banner badge */}
        <div className="absolute top-2 left-2 bg-[#E8A500] text-black px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-lg -rotate-6 transform shadow-md z-20 tracking-wider">
          STAY TUNED
        </div>

        {/* Decorative background grid/glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-20 bg-[#E8A500] animate-pulse" />
          <div className="absolute left-1/4 top-1/4 w-32 h-32 rounded-full blur-3xl opacity-10 bg-[#7B2FBE]" />
        </div>

        {/* Desktop floating visual elements */}
        <div className="absolute right-6 bottom-0 top-4 w-1/2 hidden sm:flex items-center justify-end gap-6 z-10 pointer-events-none">
          <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
            {/* Spinning/pulsating glowing container */}
            <div className="absolute inset-0 rounded-3xl border border-dashed border-[#E8A500]/30 animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-3 rounded-2xl border border-dashed border-[#E8A500]/15 animate-[spin_40s_linear_infinite_reverse]" />
            <div className="absolute w-16 h-16 rounded-full blur-2xl opacity-25 bg-[#E8A500]" />
            
            <div className="relative z-10 text-[#E8A500] flex flex-col items-center justify-center">
              {/* Cup / Trophy / Calendar Icon */}
              <div className="p-3.5 rounded-2xl bg-[#E8A500]/10 border border-[#E8A500]/25 shadow-inner">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M12 2a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-between mt-4 sm:mt-6">
          <div>
            <p className="font-extrabold tracking-wider text-[9px] sm:text-[11px] md:text-xs mb-0.5 sm:mb-1" style={{ color: T.text3, letterSpacing: "0.08em" }}>
              COMPETITION & CHALLENGE
            </p>
            <h3
              className="font-black text-lg sm:text-2xl md:text-3xl italic uppercase tracking-wide leading-none mb-1.5 sm:mb-2.5 text-gradient-gold"
              style={{
                fontFamily: "var(--font-display)",
              }}
            >
              TANTANGAN BARU AKAN SEGERA HADIR!
            </h3>
            <p className="text-[10px] sm:text-xs md:text-sm max-w-[90%] sm:max-w-[50%] mb-2 sm:mb-4" style={{ color: T.text2, lineHeight: 1.3 }}>
              Kompetisi seru berhadiah ratusan ribu <strong className="text-[#E8A500]">XP</strong> dan <strong className="text-[#E8A500]">Emas</strong> sedang disiapkan. Tingkatkan terus aktivitas listing dan prospect Anda agar siap bersaing di puncak klasemen!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-card/60 backdrop-blur-sm" style={{ borderColor: T.border }}>
                <svg className="w-4 h-4 flex-shrink-0 text-[#E8A500]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div className="text-left">
                  <p style={{ fontSize: 8, color: T.text3, textTransform: "uppercase" }}>Persiapan</p>
                  <p className="font-bold text-[10px] md:text-xs" style={{ color: T.text1 }}>Kerjakan Quest Harian</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-card/60 backdrop-blur-sm" style={{ borderColor: T.border }}>
                <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-[#E8A500]/10 border border-[#E8A500]/20 flex-shrink-0">
                  <span className="text-[9px] font-black text-[#E8A500]" style={{ fontFamily: "var(--font-display)" }}>XP</span>
                </div>
                <div className="text-left">
                  <p style={{ fontSize: 8, color: T.text3, textTransform: "uppercase" }}>Hadiah</p>
                  <p className="font-bold text-[10px] md:text-xs text-[#E8A500]">Ratusan Ribu XP</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNav("quest")}
              className="w-full sm:w-auto mt-2 sm:mt-0 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#E8A500] hover:bg-[#CC9200] text-black transition-all shadow-md active:scale-95 cursor-pointer"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Kerjakan Quest Sekarang <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>
    );
  }

  const activeEvent = events[current];

  return (
    <div className="space-y-1">
      <SwipeCarouselZone onPrev={handlePrev} onNext={handleNext} className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEvent.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <EventBannerSlide event={activeEvent} isDark={isDark} onNav={onNav} onEventDetail={onEventDetail} />
          </motion.div>
        </AnimatePresence>
      </SwipeCarouselZone>

      <div className="flex justify-center gap-2 mt-1">
        {events.map((ev, i) => (
          <button
            key={ev.id}
            onClick={() => {
              goTo(i);
              resetAutoplay();
            }}
            aria-label={`Slide event ${i + 1}`}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === current ? "#E8A500" : isDark ? "#3F3F46" : "#E2E8F0",
              transform: i === current ? "scale(1.25)" : "scale(1)",
              boxShadow: i === current ? "0 0 6px rgba(232,165,0,0.5)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
