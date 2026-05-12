type Props = {
  count: number;
};

export function SpectatorCount({ count }: Props) {
  return (
    <div>
      {typeof count === "number" && count > 0 && (
        <div className="mb-2 text-xs text-white/60">
          {"Spectating this game: "}
          {count}{" "}
        </div>
      )}{" "}
    </div>
  );
}
