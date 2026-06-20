import { useState } from "react";
import { T } from "../types";

export default function AuthInput({ label, type = "text", placeholder, icon, value, onChange, action }: {
  label: string; type?: string; placeholder: string;
  icon: React.ReactNode; value: string; onChange: (v: string) => void;
  action?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium" style={{ color: T.text2 }}>{label}</label>
        {action}
      </div>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: focused ? "#E8A500" : "#9CA3AF" }}>
          {icon}
        </div>
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 rounded-xl border outline-none transition-colors bg-card"
          style={{ height: 48, borderColor: focused ? "#E8A500" : "var(--border)", fontSize: 14, fontFamily: "'Inter', sans-serif", boxShadow: focused ? "0 0 0 3px #E8A50015" : "none" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)} />
      </div>
    </div>
  );
}
