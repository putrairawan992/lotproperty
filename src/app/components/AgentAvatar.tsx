import { useState } from "react";

export default function AgentAvatar({ initials, size, isMe = false, photo }: { initials: string; size: number; isMe?: boolean; photo?: string }) {
  const [imgError, setImgError] = useState(false);
  const gradientBg = "linear-gradient(135deg, #E8A500, #C8922A)";
  const defaultBg = "linear-gradient(135deg, var(--muted), var(--muted-foreground))";
  if (photo && !imgError) {
    return (
      <img
        src={photo}
        alt={initials}
        className="rounded-full object-cover object-center flex-shrink-0"
        style={{ width: size, height: size, objectFit: "cover", objectPosition: "center center", transform: "translateZ(0)" }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: isMe ? gradientBg : defaultBg,
        color: isMe ? "#FFF" : "var(--foreground)",
        fontFamily: "'Rajdhani', sans-serif",
        letterSpacing: "0.5px",
      }}>
      {initials}
    </div>
  );
}
