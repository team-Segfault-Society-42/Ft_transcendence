import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { EmptyStateCard } from "@/components/ui/EmptyCard";

interface User {
	id: number;
	username: string;
	wins: number;
	losses: number;
	draws: number;
	bio: string;
	avatar: string;
	xp: number;
	isTwoFactorEnabled: boolean;
}

export default function Settings() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [user] =
		useOutletContext<
			[User | null, React.Dispatch<React.SetStateAction<User | null>>]
		>();

	if (!user) {
		return (
			<section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
				<EmptyStateCard
					title={t("settings.title")}
					icon={<span className="text-xl font-bold">?</span>}
					message={t("settings.notConnected")}
					description={t("settings.login")}
					actions={
						<Button onClick={() => navigate("/")}>
							{t("buttons.backHome")}
						</Button>
					}
				/>
			</section>
		);
	}

	return (
		<section className="w-full max-w-4xl mx-auto px-6 py-10 text-white">
			<div className="mb-8">
				<h1 className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
					{t("settings.title")}
				</h1>
				<p className="text-white/50 mt-2">
					{t("settings.description")}
				</p>
			</div>

			<div className="grid gap-6">
				<Card>
					<CardTitle>{t("settings.profile.title")}</CardTitle>
					<CardDescription className="text-white/50">
						{t("settings.profile.description")}
					</CardDescription>
				</Card>

				<Card>
					<CardTitle>{t("settings.security.title")}</CardTitle>
					<CardDescription className="text-white/50">
						{t("settings.security.description")}
					</CardDescription>
				</Card>
			</div>
		</section>
	);
}
