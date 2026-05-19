import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
	count: number;
};

export function SpectatorCount({ count }: Props) {
	const { t } = useTranslation();
	if (count <= 0) return null;

	return (
		<div className="mb-2 flex items-center justify-center gap-1 text-xs text-white/60">
			<Eye size={14} />

			<span>
				{t('game.spectators', { count })}
			</span>
		</div>
	);
}
