import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { spectatorCountClasses } from '@/styles/gameChatClasses';

type Props = {
	count: number;
};

export function SpectatorCount({ count }: Props) {
	const { t } = useTranslation();
	if (count <= 0) return null;

	return (
		<div className={spectatorCountClasses.container}>
			<Eye size={14} />

			<span>
				{t('game.spectators', { count })}
			</span>
		</div>
	);
}
