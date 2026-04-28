import { Button } from "@/components/ui/Button";

export function OAuth42Button() {
  function handleLogin() {
    window.location.href = import.meta.env.VITE_OAUTH_42_START_URL;
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10"
      onClick={handleLogin}
    >
      <img
        src="/42logo.png"
        alt="42"
        className="w-5 h-5"
      />
      Continue with 42
    </Button>
  );
}