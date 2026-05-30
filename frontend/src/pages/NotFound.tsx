import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <EmptyStateCard
      title=""
      icon={<span className="text-8xl font-black">404</span>}
      message={t("notFound.title")}
      description={t("notFound.description")}
      actions={<Button onClick={() => navigate("/")}>{t("notFound.goHome")}</Button>}
    />
  );
}
