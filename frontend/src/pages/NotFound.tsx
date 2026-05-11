import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <EmptyStateCard
      title="404"
      icon={<span className="text-2xl">🔍</span>}
      message="Page not found"
      description="This page doesn't exist or has been moved."
      actions={<Button onClick={() => navigate("/")}>Go Home</Button>}
    />
  );
}
