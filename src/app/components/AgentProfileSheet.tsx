import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Drawer, DrawerContent } from "./ui/drawer";
import ProfilePage from "../pages/ProfilePage";
import { T } from "../types";

export default function AgentProfileSheet({ agentId, onClose }: { agentId: string | null; onClose: () => void }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!agentId) return null;

  // Desktop/Tablet: centered modal overlay
  if (!isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        {/* Modal */}
        <div
          className="relative z-10 w-full max-w-lg max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          style={{
            backgroundColor: "var(--background)",
            border: "2px solid transparent",
            backgroundImage: "linear-gradient(var(--background), var(--background)), linear-gradient(135deg, #E8A500, #C8922A, #E8A500)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X size={18} />
          </button>
          {/* Scrollable content */}
          <div className="overflow-y-auto px-4 py-2">
            <ProfilePage agentId={agentId} />
          </div>
        </div>
      </div>
    );
  }

  // Mobile: bottom sheet drawer
  return (
    <Drawer open={!!agentId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent
        className="max-h-[70vh] rounded-t-3xl max-w-lg mx-auto"
        style={{
          borderTopWidth: 2,
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderBottomWidth: 0,
          borderStyle: "solid",
          borderColor: "transparent",
          backgroundImage: "linear-gradient(var(--background), var(--background)), linear-gradient(90deg, #E8A500, #C8922A, #E8A500)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
      >
        <div className="overflow-y-auto px-4">
          <ProfilePage agentId={agentId} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
