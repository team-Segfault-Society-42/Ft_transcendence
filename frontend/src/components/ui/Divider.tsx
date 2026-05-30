/**
 * Displays a reusable divider component with
 * centered text content.
 *
 * Commonly used between authentication actions
 * or separated content sections.
 *
 * Supports:
 * - custom divider text
 */
export function Divider({ text = "OR" }: { text?: string }) {
    return (
      <div className="flex items-center gap-4 my-4">

        {/* LEFT LINE */}
        <div className="flex-1 h-px bg-white/10" />

        {/* DIVIDER TEXT */}
        <span className="text-white/50 text-sm">
          {text}
        </span>

        {/* RIGHT LINE */}
        <div className="flex-1 h-px bg-white/10" />
      </div>
    );
  }