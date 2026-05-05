import { UsersRound } from "lucide-react";
import { BasicChat } from "@/components/BasicChat";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

interface User {
  username: string;
  avatar?: string;
  bio?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  xp?: number;
}

export default function Chat() {
  const { t } = useTranslation();
  const { user } = useOutletContext<{ user: User | null }>();
  const navigate = useNavigate();

  if (!user) {
    return (
      <section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
        <EmptyStateCard
          title={t("chat.title")}
          icon={<UsersRound size={24} />}
          message={t("chat.notConnected")}
          description={t("chat.login")}
          actions={
            <Button onClick={() => navigate("/")}>
              {t("buttons.backHome")}
            </Button>
          }
        />
      </section>
    );
  }

  return <BasicChat />;
}
