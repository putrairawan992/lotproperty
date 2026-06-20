import { Award, Play, CheckCircle } from "lucide-react";
import Card from "../components/Card";
import XPBar from "../components/XPBar";
import { T } from "../types";
import { useTabQuery } from "../routes";

export default function AcademyPage() {
  const [cat, setCat] = useTabQuery("cat", "Semua");
  const categories = ["Semua", "SOP Internal", "Sales Training", "Negotiation", "Marketing", "Social Media", "Product Knowledge"];
  const modules = [
    { title: "Teknik Negosiasi Tingkat Lanjut", cat: "Negotiation", prog: 60, dur: "2.5 jam", xp: 200, status: "in_progress", color: "#C8922A" },
    { title: "KPR & Pembiayaan Properti", cat: "Product Knowledge", prog: 100, dur: "1.5 jam", xp: 200, status: "done", color: "#1A6FC4" },
    { title: "Strategi Konten Instagram Properti", cat: "Social Media", prog: 30, dur: "3 jam", xp: 200, status: "in_progress", color: "#7B2FBE" },
    { title: "SOP Listing & Update Database", cat: "SOP Internal", prog: 0, dur: "1 jam", xp: 200, status: "not_started", color: "#16A34A" },
    { title: "Closing Techniques 101", cat: "Sales Training", prog: 0, dur: "2 jam", xp: 200, status: "not_started", color: "#DC2626" },
    { title: "Market Update Q2 2025", cat: "Product Knowledge", prog: 100, dur: "45 min", xp: 200, status: "done", color: "#1A6FC4" },
    { title: "Personal Branding untuk Agent", cat: "Marketing", prog: 15, dur: "2 jam", xp: 200, status: "in_progress", color: "#E8A500" },
    { title: "Etika & Profesionalisme Agent", cat: "SOP Internal", prog: 0, dur: "1.5 jam", xp: 200, status: "not_started", color: "#16A34A" },
  ];
  const shown = cat === "Semua" ? modules : modules.filter(m => m.cat === cat);

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, color: T.text1 }}>Academy</h1>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: "#FDF6E3", color: "#C8922A", fontWeight: 600 }}>
            <Award size={14} /> 2 Module Selesai — +400 XP
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ backgroundColor: cat === c ? "#E8A500" : "white", color: cat === c ? "white" : "#4B5563", border: `1px solid ${cat === c ? "#E8A500" : "var(--border)"}` }}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((m, i) => (
            <Card key={i} className="p-5 flex flex-col" style={{ borderTop: `3px solid ${m.color}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: `${m.color}18`, color: m.color }}>{m.cat}</span>
                {m.status === "done" && <CheckCircle size={16} style={{ color: "#16A34A" }} />}
              </div>
              <h3 className="font-bold mb-3 flex-1" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, color: T.text1, lineHeight: 1.3 }}>{m.title}</h3>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: T.text3 }}>
                  <span>{m.prog}%</span><span>{m.dur}</span>
                </div>
                <XPBar value={m.prog} max={100} height={5} />
              </div>
              <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs font-bold" style={{ color: "#C8922A" }}>+{m.xp} XP</span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    backgroundColor: m.status === "done" ? "#DCFCE7" : "#E8A500",
                    color: m.status === "done" ? "#16A34A" : "white",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                  onMouseEnter={e => { if (m.status !== "done") e.currentTarget.style.backgroundColor = "#CC9200"; }}
                  onMouseLeave={e => { if (m.status !== "done") e.currentTarget.style.backgroundColor = "#E8A500"; }}>
                  {m.status === "done" ? "✓ Selesai" : m.status === "in_progress" ? <><Play size={11} /> Lanjutkan</> : <><Play size={11} /> Mulai</>}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
