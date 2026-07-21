import { useEffect, useRef, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Server, Database, Download, RefreshCw } from "lucide-react";
import Card from "../../components/Card";
import { T } from "../../types";
import { api, getAuthToken, BASE_URL } from "../../services/api";

interface ServerStatus {
  disk_total_kb: number;
  disk_used_kb: number;
  disk_free_kb: number;
  mem_total_kb: number;
  mem_used_kb: number;
  mem_available_kb: number;
  load_avg_1: number;
  uptime_seconds: number;
  timestamp: string;
}

interface BackupItem {
  filename: string;
  size_bytes: number;
  created_at: string;
}

function formatBytes(kb: number) {
  if (!kb) return "0 MB";
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(0)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}h ${h % 24}j`;
  return `${h}j ${Math.floor((seconds % 3600) / 60)}m`;
}

const POLL_MS = 30000;
const MAX_POINTS = 20;

export default function AdminStorageServerPage() {
  const [tab, setTab] = useState<"status" | "backup">("status");
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [online, setOnline] = useState(true);
  const [history, setHistory] = useState<{ time: string; memPct: number; diskPct: number }[]>([]);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [backupLoading, setBackupLoading] = useState(true);
  const [runningBackup, setRunningBackup] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const triggerToast = (text: string, error?: boolean) => {
    setToastMsg({ text, error });
    setTimeout(() => setToastMsg(null), 3000);
  };
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStatus = async () => {
    try {
      const s = await api.admin.getServerStatus();
      setStatus(s);
      setOnline(true);
      const memPct = s.mem_total_kb ? Math.round((s.mem_used_kb / s.mem_total_kb) * 100) : 0;
      const diskPct = s.disk_total_kb ? Math.round((s.disk_used_kb / s.disk_total_kb) * 100) : 0;
      setHistory(h => [...h, {
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        memPct, diskPct,
      }].slice(-MAX_POINTS));
    } catch {
      setOnline(false);
    }
  };

  const loadBackups = async () => {
    try {
      setBackupLoading(true);
      const rows = await api.admin.getBackups();
      setBackups(Array.isArray(rows) ? rows : []);
    } catch {
      setBackups([]);
    } finally {
      setBackupLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    loadBackups();
    pollRef.current = setInterval(loadStatus, POLL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleRunBackup = async () => {
    setRunningBackup(true);
    try {
      await api.admin.runBackup();
      await loadBackups();
      triggerToast("Backup berhasil dijalankan!");
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Gagal menjalankan backup", true);
    } finally {
      setRunningBackup(false);
    }
  };

  const handleDownload = async (filename: string) => {
    setDownloadingFile(filename);
    try {
      const res = await fetch(`${BASE_URL}/admin/backups/${encodeURIComponent(filename)}/download`, {
        headers: { Authorization: `Bearer ${getAuthToken() || ""}` },
      });
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // no-op: user can retry
    } finally {
      setDownloadingFile(null);
    }
  };

  const memPct = status?.mem_total_kb ? Math.round((status.mem_used_kb / status.mem_total_kb) * 100) : 0;
  const diskPct = status?.disk_total_kb ? Math.round((status.disk_used_kb / status.disk_total_kb) * 100) : 0;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      {toastMsg && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold text-white"
          style={{ backgroundColor: toastMsg.error ? "#DC2626" : "#16A34A" }}
        >
          {toastMsg.text}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>Storage Server</h1>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5"
          style={{ backgroundColor: online ? "#DCFCE7" : "#FEE2E2", color: online ? "#16A34A" : "#DC2626" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: online ? "#16A34A" : "#DC2626" }} />
          {online ? "Server Online" : "Server Offline / Tidak Terjangkau"}
        </span>
      </div>

      <div className="flex gap-1 border-b" style={{ borderColor: T.border }}>
        {[{ id: "status", label: "Server Status" }, { id: "backup", label: "Backup" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as "status" | "backup")}
            className="px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{
              color: tab === t.id ? "#E8A500" : T.text3,
              borderBottom: `2px solid ${tab === t.id ? "#E8A500" : "transparent"}`,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "status" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4">
              <p className="text-xs" style={{ color: T.text3 }}>Disk Terpakai</p>
              <p className="text-lg font-bold mt-1" style={{ color: T.text1 }}>{diskPct}%</p>
              <p className="text-xs mt-0.5" style={{ color: T.text3 }}>{formatBytes(status?.disk_used_kb || 0)} / {formatBytes(status?.disk_total_kb || 0)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs" style={{ color: T.text3 }}>Memory Terpakai</p>
              <p className="text-lg font-bold mt-1" style={{ color: T.text1 }}>{memPct}%</p>
              <p className="text-xs mt-0.5" style={{ color: T.text3 }}>{formatBytes(status?.mem_used_kb || 0)} / {formatBytes(status?.mem_total_kb || 0)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs" style={{ color: T.text3 }}>Load Average</p>
              <p className="text-lg font-bold mt-1" style={{ color: T.text1 }}>{status?.load_avg_1?.toFixed(2) ?? "-"}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs" style={{ color: T.text3 }}>Backend Uptime</p>
              <p className="text-lg font-bold mt-1" style={{ color: T.text1 }}>{status ? formatUptime(status.uptime_seconds) : "-"}</p>
            </Card>
          </div>

          <Card className="p-4">
            <p className="text-sm font-semibold mb-3" style={{ color: T.text1 }}>Penggunaan Disk &amp; Memory (30 dtk terakhir)</p>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <AreaChart data={history}>
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke={T.text3} />
                  <YAxis tick={{ fontSize: 10 }} stroke={T.text3} domain={[0, 100]} unit="%" />
                  <Tooltip />
                  <Area type="monotone" dataKey="diskPct" name="Disk %" stroke="#E8A500" fill="#E8A50033" />
                  <Area type="monotone" dataKey="memPct" name="Memory %" stroke="#1A6FC4" fill="#1A6FC433" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {tab === "backup" && (
        <div className="space-y-4">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: T.text1 }}>Backup Database Mingguan</p>
              <p className="text-xs mt-0.5" style={{ color: T.text3 }}>Otomatis setiap Minggu 03:00 · menyimpan 4 backup terakhir</p>
            </div>
            <button onClick={handleRunBackup} disabled={runningBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ backgroundColor: "#E8A500", opacity: runningBackup ? 0.6 : 1 }}>
              <RefreshCw size={14} className={runningBackup ? "animate-spin" : ""} />
              {runningBackup ? "Menjalankan..." : "Backup Sekarang"}
            </button>
          </Card>

          <Card className="overflow-hidden">
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {backupLoading && (
                <div className="px-5 py-6 text-sm" style={{ color: T.text3 }}>Memuat daftar backup...</div>
              )}
              {!backupLoading && backups.length === 0 && (
                <div className="px-5 py-6 text-sm flex items-center gap-2" style={{ color: T.text3 }}>
                  <Database size={16} /> Belum ada backup.
                </div>
              )}
              {backups.map(b => (
                <div key={b.filename} className="flex items-center gap-4 px-5 py-3.5">
                  <Server size={16} style={{ color: T.text3 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: T.text1 }}>{b.filename}</p>
                    <p className="text-xs mt-0.5" style={{ color: T.text3 }}>
                      {new Date(b.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {" · "}{(b.size_bytes / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button onClick={() => handleDownload(b.filename)} disabled={downloadingFile === b.filename}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border"
                    style={{ borderColor: T.border, color: T.text2 }}>
                    <Download size={13} />
                    {downloadingFile === b.filename ? "..." : "Unduh"}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
