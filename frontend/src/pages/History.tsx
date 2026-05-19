import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router';
import { userService } from '@/services/userService';
import type { Match } from '@/lib/match';
import { GameHistoryCard } from '@/components/home/GameHistoryCard';
import { History as HistoryIcon } from 'lucide-react';
import { EmptyStateCard } from '@/components/ui/EmptyCard';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import type { User } from "@/type/user.types";

export default function History() {
	const { t } = useTranslation();
	const [user] = useOutletContext<[User | null, any]>();
	const [matches, setMatches] = useState<Match[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) return;

		const userId = user.id;
		async function fetchHistory() {
			try {
				const data = await userService.getUserHistory(userId);

				// tri
				const sorted = data.sort(
					(a: Match, b: Match) =>
						new Date(b.date).getTime() - new Date(a.date).getTime(),
				);

				setMatches(sorted);
			} catch (error) {
				console.error('Failed to fetch history:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchHistory();
	}, [user]);

	if (!user || loading) {
		return (
			<section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
				<EmptyStateCard
					title={t('history.title')}
					icon={<HistoryIcon size={24} />}
					message={t('history.notConnected')}
					description={t('history.login')}
					actions={
						<>
							<Button onClick={() => navigate('/')}>
								{t('buttons.backHome')}
							</Button>
						</>
					}
				/>
			</section>
		);
	}

	return (
		<section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
			{/* CARD */}
			<GameHistoryCard matches={matches} user={user} />
		</section>
	);
}
