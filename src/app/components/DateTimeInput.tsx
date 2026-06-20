import type { InputHTMLAttributes } from "react";
import { Calendar, Clock } from "lucide-react";
import { useTheme } from "../types";

const ICON_LIGHT = "#6B7280";
const ICON_DARK = "#FFFFFF";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

function FieldIcon({ isDark, icon: Icon }: { isDark: boolean; icon: typeof Calendar }) {
  return (
    <Icon
      size={16}
      className="datetime-field__icon pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      style={{ color: isDark ? ICON_DARK : ICON_LIGHT }}
      aria-hidden
    />
  );
}

export function DateInput({ className = "", style, ...props }: FieldProps) {
  const { isDark } = useTheme();
  return (
    <div className="datetime-field relative">
      <input
        type="date"
        className={`datetime-field__input w-full px-3 py-2.5 pr-10 rounded-xl border bg-card text-sm outline-none ${className}`}
        style={style}
        {...props}
      />
      <FieldIcon isDark={isDark} icon={Calendar} />
    </div>
  );
}

export function TimeInput({ className = "", style, ...props }: FieldProps) {
  const { isDark } = useTheme();
  return (
    <div className="datetime-field relative">
      <input
        type="time"
        className={`datetime-field__input w-full px-3 py-2.5 pr-10 rounded-xl border bg-card text-sm outline-none ${className}`}
        style={style}
        {...props}
      />
      <FieldIcon isDark={isDark} icon={Clock} />
    </div>
  );
}
