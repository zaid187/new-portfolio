import React from "react";

type MacbookScrollProps = {
  children: React.ReactNode;
  src?: string;
  showGradient?: boolean;
  title?: React.ReactNode;
  badge?: React.ReactNode;
  screenHeight?: string;
};

// ---------- Mini components (speakers, keyboard, trackpad) ----------
const SpeakerGrid = () => (
  <div className="grid grid-cols-2 gap-1 p-1">
    {Array.from({ length: 40 }).map((_, i) => (
      <div
        key={i}
        className="h-1 w-1 rounded-full bg-neutral-700 dark:bg-neutral-500"
      />
    ))}
  </div>
);

const Keypad = () => (
  <div className="grid grid-cols-14 gap-1 p-2">
    {Array.from({ length: 70 }).map((_, i) => (
      <div
        key={i}
        className="h-3 w-3 rounded-sm bg-neutral-600 dark:bg-neutral-400"
      />
    ))}
  </div>
);

const Trackpad = () => (
  <div className="mx-auto mt-4 h-20 w-40 rounded-lg bg-neutral-700 dark:bg-neutral-500" />
);

// --------------------- MAIN COMPONENT ---------------------
export default function MacbookScroll({
  children,
  src,
  showGradient = true,
  title,
  badge,
  screenHeight = "72vh",
}: MacbookScrollProps): JSX.Element {
  return (
    <div className="w-full flex justify-center px-4">
      <div className="relative max-w-[1100px] w-full">
        {/* Title above Macbook */}
        {title && (
          <div className="absolute left-1/2 -translate-x-1/2 top-2 pointer-events-none z-30">
            <div className="text-sm font-semibold text-muted-foreground">
              {title}
            </div>
          </div>
        )}

        {/* Macbook frame */}
        <div className="relative mt-8">
          {/* Top lid */}
          <div
            aria-hidden
            className="mx-auto max-w-[980px] rounded-t-[14px] bg-black/90 shadow-lg transform-gpu"
            style={{ height: "180px" }}
          >
            <div className="h-full flex items-start justify-start p-3">
              {badge && <div className="pointer-events-none">{badge}</div>}
            </div>
          </div>

          {/* Screen */}
          <div className="mx-auto max-w-[980px] -translate-y-6 rounded-b-[14px] overflow-hidden shadow-2xl">
            <div
              className="relative bg-background/0 overflow-hidden"
              style={{ height: screenHeight }}
            >
              <div
                className="h-full overflow-y-auto scroll-smooth"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="min-h-full">{children}</div>
              </div>

              {showGradient && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent"
                />
              )}
            </div>
          </div>

          {/* Bottom (keyboard + speakers + trackpad) */}
          <div className="mx-auto max-w-[980px] -translate-y-4 mt-2 rounded-b-lg bg-gray-900/80">
            <div className="relative flex">
              <div className="mx-auto h-full w-[10%] overflow-hidden">
                <SpeakerGrid />
              </div>
              <div className="mx-auto h-full w-[80%]">
                <Keypad />
              </div>
              <div className="mx-auto h-full w-[10%] overflow-hidden">
                <SpeakerGrid />
              </div>
            </div>
            <Trackpad />
          </div>
        </div>
      </div>
    </div>
  );
}
