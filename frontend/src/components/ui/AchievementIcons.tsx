import { ACHIEVEMENT_ICONS, IconKey } from "@/type/achievements.types";
import { Info, Lock } from "lucide-react";

interface AchievementIconProps {
  iconName: string;
  isUnlocked: boolean;
  size?: number;
  className?: string;
}

export function AchievementIcon({
  iconName,
  isUnlocked,
  size = 24,
  className = "",
}: AchievementIconProps) {
  const IconComponent = ACHIEVEMENT_ICONS[iconName as IconKey] || Info;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <IconComponent
        size={size}
        className={`transition-all duration-500 ${
          isUnlocked
            ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            : "text-white/10 grayscale"
        }`}
      />

      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <Lock size={size / 2} className="text-white/30" />
        </div>
      )}
    </div>
  );
}
