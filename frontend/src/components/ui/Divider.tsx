export function Divider({ text = "OR" }: { text?: string }) {
    return (
      <div className="flex items-center gap-4 my-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/50 text-sm">{text}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    );
  }