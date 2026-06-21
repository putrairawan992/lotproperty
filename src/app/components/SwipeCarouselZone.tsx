import { motion, PanInfo } from "motion/react";
import { ReactNode } from "react";

const SWIPE_OFFSET = 48;
const SWIPE_VELOCITY = 420;

interface SwipeCarouselZoneProps {
  onPrev?: () => void;
  onNext?: () => void;
  children: ReactNode;
  className?: string;
}

export default function SwipeCarouselZone({ onPrev, onNext, children, className }: SwipeCarouselZoneProps) {
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if ((offset.x <= -SWIPE_OFFSET || velocity.x <= -SWIPE_VELOCITY) && onNext) {
      onNext();
      return;
    }
    if ((offset.x >= SWIPE_OFFSET || velocity.x >= SWIPE_VELOCITY) && onPrev) {
      onPrev();
    }
  };

  if (!onPrev && !onNext) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.14}
      onDragEnd={handleDragEnd}
      style={{ touchAction: "pan-y", cursor: "grab" }}
      whileDrag={{ cursor: "grabbing" }}
    >
      {children}
    </motion.div>
  );
}
