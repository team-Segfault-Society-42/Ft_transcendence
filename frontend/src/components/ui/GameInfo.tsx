import { useTranslation } from "react-i18next";
  
  export function GameInfo() {

    const { t } = useTranslation();
    
    return (
      <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
  
        <div className="grid grid-cols-3 w-12 h-12 text-cyan-400 text-xs">
            <div className="flex items-center justify-center border-b border-r border-white/20">✖</div>
            <div className="flex items-center justify-center border-b border-r border-white/20">⭕</div>
            <div className="flex items-center justify-center border-b border-white/20">✖</div>

            <div className="flex items-center justify-center border-b border-r border-white/20">⭕</div>
            <div className="flex items-center justify-center border-b border-r border-white/20">✖</div>
            <div className="flex items-center justify-center border-b border-white/20">⭕</div>

            <div className="flex items-center justify-center border-r border-white/20">✖</div>
            <div className="flex items-center justify-center border-r border-white/20">⭕</div>
            <div className="flex items-center justify-center">✖</div>
        </div>
  
        <div className="flex flex-col">
            <span className="text-sm text-white/60 max-w-xs">
                {t("home.play.description")}
            </span>
        </div>
      </div>
    )
  }