import { Drawer, DrawerContent } from "./ui/drawer";
import ProfilePage from "../pages/ProfilePage";

export default function AgentProfileSheet({ agentId, onClose }: { agentId: string | null; onClose: () => void }) {
  return (
    <Drawer open={!!agentId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent
        className="max-h-[70vh] rounded-t-3xl md:max-w-[70%] mx-auto"
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
          {agentId && <ProfilePage agentId={agentId} />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
