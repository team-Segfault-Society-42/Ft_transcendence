import { Avatar } from "@/components/ui/Avatar";
import { Username } from "@/components/ui/Username";
import type { PublicUser } from "@/services/friendsService";

type UserRowProps = {
	user: PublicUser;
	onClick?: () => void;
};

/**
 * Displays compact public user information.
 *
 * @param user - Public user shown in friend/search rows.
 * @param onClick - Optional callback used to open the user profile.
 * @returns Compact user row.
 */
export function UserRow({ user, onClick }: UserRowProps) {
	return (
		<div
			className={`flex items-center gap-3 min-w-0 overflow-visible ${
				onClick ? "cursor-pointer" : ""
			}`}
			onClick={onClick}
		>
			<Avatar
				src={user.avatar}
				alt={user.username}
				fallback={user.username[0]?.toUpperCase() ?? "?"}
				size="sm"
			/>

			<div className="min-w-0">
				<Username
					className="font-semibold"
					name={user.username}
					variant="card"
				/>

				<p className="text-xs text-white/40 truncate">
					{user.xp} XP
				</p>
			</div>
		</div>
	);
}
