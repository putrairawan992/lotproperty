import { Page } from "../types";
import { NAV_TABS } from "../routes";

export default function BottomTabs({ current, onNav }: { current: Page; onNav: (p: Page) => void }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t z-50 bottom-nav flex justify-center"
      style={{ height: 60, paddingBottom: "env(safe-area-inset-bottom)", backgroundColor: "var(--sidebar)" }}
    >
      <div className="flex w-full md:w-auto md:max-w-[560px] lg:max-w-[640px] md:mx-auto md:px-4 md:gap-1 lg:gap-2">
        {NAV_TABS.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className="flex-1 md:flex-none flex flex-col items-center justify-center gap-0.5 transition-colors relative md:min-w-[56px] lg:min-w-[64px] md:px-1.5 lg:px-2"
              style={{ color: active ? "#E8A500" : "var(--muted-foreground)" }}
            >
              <Icon size={active ? 22 : 20} />
              <span style={{ fontSize: 9, fontFamily: "'Inter', sans-serif", fontWeight: active ? 700 : 400 }}>{label}</span>
              {active && (
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full"
                  style={{ width: 24, height: 3, backgroundColor: "#E8A500" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
