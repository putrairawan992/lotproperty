import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import jsQR from "jsqr";

function isMobileDevice(): boolean {
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && window.matchMedia("(max-width: 768px)").matches)
  );
}

async function openCameraStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Browser tidak mendukung akses kamera.");
  }

  const mobile = isMobileDevice();
  const attempts: MediaStreamConstraints[] = mobile
    ? [
        { video: { facingMode: { exact: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
        { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
        { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      ]
    : [{ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }];

  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("Tidak dapat mengakses kamera.");
}

async function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return;

  await new Promise<void>((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Gagal memuat stream kamera."));
    };
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("error", onError);
  });
}

async function safePlayVideo(video: HTMLVideoElement): Promise<void> {
  await waitForVideoReady(video);
  try {
    await video.play();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    throw err;
  }
}

interface QrCameraScannerProps {
  onScan: (data: string) => void;
  active: boolean;
}

export default function QrCameraScanner({ onScan, active }: QrCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const scannedRef = useRef(false);
  const startingRef = useRef(false);
  const sessionRef = useRef(0);

  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const stopCamera = useCallback(() => {
    sessionRef.current += 1;
    cancelAnimationFrame(rafRef.current);

    const hadStream = Boolean(streamRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }

    const wasActive = hadStream || startingRef.current;
    startingRef.current = false;
    if (wasActive) {
      setCameraOn(false);
      setLoading(false);
    }
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < video.HAVE_CURRENT_DATA || scannedRef.current) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });

    if (code?.data) {
      scannedRef.current = true;
      stopCamera();
      onScanRef.current(code.data);
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    if (scannedRef.current || startingRef.current || streamRef.current) return;

    const session = sessionRef.current + 1;
    sessionRef.current = session;
    startingRef.current = true;
    setError("");
    setLoading(true);

    try {
      const stream = await openCameraStream();
      if (sessionRef.current !== session) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach(t => t.stop());
        throw new Error("Video element tidak tersedia.");
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await safePlayVideo(video);

      if (sessionRef.current !== session) return;

      setCameraOn(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      if (sessionRef.current !== session) return;
      const name = err instanceof DOMException ? err.name : "";
      setError(
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? "Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser."
          : err instanceof Error ? err.message : "Gagal mengakses kamera."
      );
      stopCamera();
    } finally {
      if (sessionRef.current === session) {
        startingRef.current = false;
        setLoading(false);
      }
    }
  }, [scanFrame, stopCamera]);

  useEffect(() => {
    if (!active) {
      scannedRef.current = false;
      if (streamRef.current || startingRef.current) {
        stopCamera();
      }
      return;
    }

    scannedRef.current = false;
    startCamera();
    return () => stopCamera();
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex items-center justify-center overflow-hidden bg-black" style={{ height: 280 }}>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        style={{ display: cameraOn ? "block" : "none" }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {[
        ["top-6 left-6", "border-t-4 border-l-4 rounded-tl-xl"],
        ["top-6 right-6", "border-t-4 border-r-4 rounded-tr-xl"],
        ["bottom-6 left-6", "border-b-4 border-l-4 rounded-bl-xl"],
        ["bottom-6 right-6", "border-b-4 border-r-4 rounded-br-xl"],
      ].map(([pos, cls], i) => (
        <div key={i} className={`absolute ${pos} ${cls} w-10 h-10 z-10 pointer-events-none`} style={{ borderColor: "#E8A500" }} />
      ))}

      {cameraOn && (
        <motion.div
          className="absolute left-10 right-10 h-0.5 z-10 pointer-events-none"
          style={{ backgroundColor: "#E8A500", opacity: 0.85, boxShadow: "0 0 8px rgba(232,165,0,0.6)" }}
          animate={{ top: ["28%", "72%", "28%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        />
      )}

      {!cameraOn && (
        <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
          {loading ? (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-[#E8A500] border-t-transparent animate-spin" />
              <p className="text-xs text-white/70">Membuka kamera...</p>
            </>
          ) : error ? (
            <>
              <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setError("");
                  startCamera();
                }}
                className="mt-1 px-4 py-2 rounded-lg text-xs font-bold bg-[#E8A500] text-white"
              >
                Coba Lagi
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <p className="text-xs text-white/60">Arahkan kamera ke QR Code</p>
              <p className="text-[10px] text-white/40">
                {isMobileDevice() ? "Kamera belakang akan digunakan otomatis" : "Kamera default perangkat akan digunakan"}
              </p>
            </>
          )}
        </div>
      )}

      {cameraOn && (
        <p className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-white/70 z-10 pointer-events-none">
          Scanning QR... arahkan ke kode event
        </p>
      )}
    </div>
  );
}

export { isMobileDevice };
