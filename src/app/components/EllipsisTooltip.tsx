import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../types";

interface EllipsisTooltipProps {
  text: string;
  className?: string; // Styles for the inner text container (e.g., truncate, line-clamp-3, text color)
  containerClassName?: string; // Styles for the outer positioning container
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export default function EllipsisTooltip({ 
  text, 
  className = "truncate max-w-full", 
  containerClassName = "",
  children,
  style
}: EllipsisTooltipProps) {
  const [show, setShow] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement | HTMLSpanElement | HTMLDivElement>(null);
  const { isDark } = useTheme();

  const checkTruncation = () => {
    const el = textRef.current;
    if (el) {
      const hasHorizontalEllipsis = el.scrollWidth > el.clientWidth;
      const hasVerticalEllipsis = el.scrollHeight > el.clientHeight;
      setIsTruncated(hasHorizontalEllipsis || hasVerticalEllipsis);
    }
  };

  useEffect(() => {
    checkTruncation();
    // Add window resize listener to recalculate truncation dynamically
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [text]);

  // Handle touch tap for mobile/tablet responsive toggle
  const handleToggle = (e: React.MouseEvent) => {
    if (isTruncated) {
      e.stopPropagation();
      setShow(prev => !prev);
    }
  };

  return (
    <div 
      className={`relative inline-block max-w-full select-none ${containerClassName}`}
      onMouseEnter={() => isTruncated && setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={handleToggle}
    >
      <div 
        ref={textRef as any} 
        className={className}
        style={style}
      >
        {children || text}
      </div>

      {show && isTruncated && (
        <div 
          className="absolute z-50 px-2.5 py-1.5 rounded-lg text-xs shadow-xl animate-fade-in pointer-events-none whitespace-normal break-words max-w-[200px] sm:max-w-[280px] md:max-w-[320px] text-left leading-normal"
          style={{
            bottom: "125%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: isDark ? "#1E1E24" : "#FFFFFF",
            color: isDark ? "#F3F4F6" : "#1F2937",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
            boxShadow: isDark 
              ? "0 4px 12px rgba(0, 0, 0, 0.4), 0 0 8px rgba(232, 165, 0, 0.15)" 
              : "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
          }}
        >
          {text}
          {/* Tooltip Arrow */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 border-r border-b"
            style={{
              bottom: "-4px",
              backgroundColor: isDark ? "#1E1E24" : "#FFFFFF",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"
            }}
          />
        </div>
      )}
    </div>
  );
}
