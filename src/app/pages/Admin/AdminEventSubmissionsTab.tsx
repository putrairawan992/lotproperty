import { useState, useEffect, useCallback } from "react";
import { Check, X, ExternalLink, Award, Zap } from "lucide-react";
import Card from "../../components/Card";
import { T } from "../../types";
import { api } from "../../services/api";

interface EventSubmissionItem {
  id: number;
  submission_url: string;
  status: "Pending" | "Approved" | "Rejected";
  reject_reason: string;
  submitted_at: string;
  event?: { title?: string; xp_pool?: number; badge?: { name?: string } };
  agent?: { name?: string; email?: string };
}

const formatDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminEventSubmissionsTab() {
  const [submissions, setSubmissions] = useState<EventSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getEventSubmissions();
      setSubmissions(Array.isArray(res) ? res : []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setToastType(type);
    setToastMsg(msg);
  };

  const approve = async (id: number) => {
    if (approvingId) return;
    setApprovingId(id);
    try {
      await api.admin.reviewEventSubmission(id, "Approved");
      notify("Submission disetujui — XP dan badge sudah dikirim ke agent.");
      await loadData();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Gagal menyetujui submission", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const reject = async (id: number, reason: string) => {
    if (rejectSubmitting) return;
    setRejectSubmitting(true);
    try {
      await api.admin.reviewEventSubmission(id, "Rejected", reason);
      setRejectId(null);
      setRejectReason("");
      notify("Submission ditolak.");
      await loadData();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Gagal menolak submission", "error");
    } finally {
      setRejectSubmitting(false);
    }
  };

  const filtered = submissions.filter(s => (s.status || "Pending") === subTab);
  const pendingCount = submissions.filter(s => (s.status || "Pending") === "Pending").length;

  return (
    <div className="space-y-4">
      {toastMsg && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold text-white ${
          toastType === "error" ? "bg-[#DC2626]" : "bg-[#16A34A]"
        }`}>
          {toastType === "error" ? <span className="text-base leading-none">⚠️</span> : <Check size={16} />}
          {toastMsg}
        </div>
      )}

      <Card>
        <div className="flex border-b text-left" style={{ borderColor: T.border }}>
          {(["Pending", "Approved", "Rejected"] as const).map(t => (
            <button key={t} onClick={() => setSubTab(t)}
              className="px-5 py-3 text-xs font-semibold transition-all cursor-pointer"
              style={{
                color: subTab === t ? "#E8A500" : "#6B7280",
                borderBottom: subTab === t ? "2px solid #E8A500" : "2px solid transparent",
              }}>
              {t} {t === "Pending" && pendingCount > 0 ? `(${pendingCount})` : ""}
            </button>
          ))}
        </div>

        {loading && <div className="py-20 text-center text-sm text-muted-foreground">Memuat submission event...</div>}

        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center text-sm text-muted-foreground">Tidak ada submission {subTab.toLowerCase()}</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="divide-y" style={{ borderColor: T.border }}>
            {filtered.map(s => (
              <div key={s.id} className="p-4 lg:p-5 space-y-3 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: T.text1 }}>{s.agent?.name || "Unknown Agent"}</p>
                    <p className="text-[11px] text-muted-foreground">{s.agent?.email || "-"} • {formatDate(s.submitted_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider" style={{ backgroundColor: "rgba(232,165,0,0.1)", color: "#E8A500" }}>
                      {s.event?.title || "Event"}
                    </span>
                    {Number(s.event?.xp_pool || 0) > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1" style={{ backgroundColor: "rgba(200,146,42,0.1)", color: "#C8922A" }}>
                        <Zap size={10} /> +{Number(s.event?.xp_pool).toLocaleString("id-ID")} XP
                      </span>
                    )}
                    {s.event?.badge?.name && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1" style={{ backgroundColor: "rgba(112,64,208,0.1)", color: "#7040D0" }}>
                        <Award size={10} /> {s.event.badge.name}
                      </span>
                    )}
                  </div>
                </div>

                <a href={s.submission_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8A500] hover:underline break-all">
                  <ExternalLink size={13} /> {s.submission_url}
                </a>

                {s.status === "Rejected" && s.reject_reason && (
                  <p className="text-xs text-red-500">Alasan: {s.reject_reason}</p>
                )}

                {s.status === "Pending" && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setRejectId(s.id)} disabled={approvingId === s.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                      Tolak
                    </button>
                    <button onClick={() => approve(s.id)} disabled={approvingId === s.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#16A34A] hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                      {approvingId === s.id ? "Memproses..." : "Approve"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {rejectId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => !rejectSubmitting && setRejectId(null)} className="absolute inset-0 bg-black/60" />
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl relative z-10 p-6" style={{ borderColor: T.border }}>
            <h3 className="font-bold text-lg text-left mb-3" style={{ color: T.text1 }}>Tolak Submission Event</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className="w-full h-24 p-3 border rounded-xl bg-card text-sm outline-none resize-none"
              style={{ borderColor: T.border, color: T.text1 }}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setRejectId(null)} disabled={rejectSubmitting} className="px-4 py-2 border rounded-xl text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed" style={{ borderColor: T.border, color: T.text3 }}>Batal</button>
              <button onClick={() => reject(rejectId, rejectReason)} disabled={rejectSubmitting} className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">
                {rejectSubmitting ? "Memproses..." : "Tolak Submission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
