import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import type { FriendStatus, PublicUser } from "@/services/friendsService";
import {
	getStatusTextClass,
	StatusDot,
	StatusLabel,
} from "./FriendStatus";
import { UserRow } from "./UserRow";

type FriendRowProps = {
	friend: PublicUser;
	status: FriendStatus;
	onOpenProfile: () => void;
	onRemove: () => void;
};

/**
 * Displays one accepted friend with realtime activity and remove action.
 *
 * @param friend - Public friend user.
 * @param status - Realtime friend status.
 * @param onOpenProfile - Opens the friend's profile page.
 * @param onRemove - Removes the accepted friendship.
 * @returns Accepted friend row.
 */
export function FriendRow({
	friend,
	status,
	onOpenProfile,
	onRemove,
}: FriendRowProps) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-3">
			<div>
				<UserRow user={friend} onClick={onOpenProfile} />

				<p className="text-xs mt-1 flex items-center gap-2">
					<StatusDot activity={status.activity} />

					<span className={getStatusTextClass(status.activity)}>
						<StatusLabel activity={status.activity} />
					</span>
				</p>
			</div>

			<Button size="sm" variant="danger" onClick={onRemove}>
				<Trash2 size={16} />
				{t("friends.actions.remove")}
			</Button>
		</div>
	);
}
