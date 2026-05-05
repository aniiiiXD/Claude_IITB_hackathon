'use client';

import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

interface MissionBannerProps {
  /** Short uppercase eyebrow (e.g. "Doctor workspace · Link 1 of the chain") */
  eyebrow: string;
  /** Mission line — what THIS workspace contributes to the chain */
  mission: string;
  /** Accent color for the eyebrow + left rule */
  accent: string;
  /** Optional small icon shown next to eyebrow */
  icon?: LucideIcon;
}

/**
 * Thin banner that threads the mission narrative into every workspace.
 * Place at the top of each role's primary page, above the page heading.
 */
export function MissionBanner({ eyebrow, mission, accent, icon: Icon }: MissionBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 border-l-2 pl-4"
      style={{ borderColor: accent }}>
      <div className="mb-1 flex items-center gap-2">
        {Icon && <Icon className="size-3.5" style={{ color: accent }} />}
        <p className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: accent }}>
          {eyebrow}
        </p>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: '#1E2D4A' }}>
        {mission}
      </p>
    </motion.div>
  );
}
