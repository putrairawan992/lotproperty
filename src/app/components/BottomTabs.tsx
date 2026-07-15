import { Page } from "../types";
import { NAV_TABS } from "../routes";

export default function BottomTabs({ current, onNav }: { current: Page; onNav: (p: Page) => void }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t z-50 bottom-nav flex justify-center"
      style={{ height: 60, paddingBottom: "env(safe-area-inset-bottom)", backgroundColor: "var(--sidebar)" }}
    >
      <div className="flex w-full md:w-auto md:max-w-[560px] lg:max-w-[640px] md:mx-auto md:px-4 md:gap-0.5 lg:gap-1">
        {NAV_TABS.map(({ id, label, icon: Icon }) => {
          const active = current === id;

          // "Explore" is the raised, floating circular tab — it pokes above the
          // bar like a camera-button, so it gets its own layout instead of the
          // plain icon+label column the other tabs use.
          if (id === "explore") {
            return (
              <button
                key={id}
                onClick={() => onNav(id)}
                className="flex-1 md:flex-none flex flex-col items-center justify-start md:min-w-[56px] lg:min-w-[64px]"
                style={{ marginTop: -14 }}
              >
                <div
                  className="explore-fab rounded-full flex items-center justify-center relative"
                  style={{
                    width: 52,
                    height: 52,
                    background: "linear-gradient(135deg, #E8A500, #C8922A)",
                    border: "4px solid var(--sidebar)",
                    boxShadow: "0 4px 14px rgba(232, 165, 0, 0.45)",
                    transform: active ? "scale(1.06)" : "scale(1)",
                  }}
                >
                  <span className="explore-fab-ring absolute inset-0 rounded-full pointer-events-none" />
                  <Icon size={22} color="white" style={{ position: "relative", zIndex: 1 }} />
                </div>
                <style>{`
                  .explore-fab { animation: exploreFabBreathe 2.2s ease-in-out infinite; transition: transform 0.2s; }
                  .explore-fab-ring { animation: exploreFabPulse 2.2s ease-in-out infinite; }
                  @keyframes exploreFabBreathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                  @keyframes exploreFabPulse {
                    0%   { box-shadow: 0 0 0 0 rgba(232, 165, 0, 0.55); }
                    70%  { box-shadow: 0 0 0 10px rgba(232, 165, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(232, 165, 0, 0); }
                  }
                `}</style>
              </button>
            );
          }

          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className="flex-1 md:flex-none min-w-0 px-0.5 flex flex-col items-center justify-center gap-0.5 transition-colors relative md:min-w-[56px] lg:min-w-[64px] md:px-1 lg:px-1.5"
              style={{ color: active ? "#E8A500" : "var(--muted-foreground)" }}
            >
              <Icon size={active ? 22 : 20} />
              <span className="w-full truncate text-center" style={{ fontSize: 9, fontFamily: "'Inter', sans-serif", fontWeight: active ? 700 : 400 }}>{label}</span>
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
