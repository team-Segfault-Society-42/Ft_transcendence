import { useTranslation } from "react-i18next";
import type { FriendStatus } from "@/services/friendsService";

type FriendActivity = FriendStatus["activity"];

/**
 * Returns the text color for a friend activity state.
 *
 * @param activity - Friend realtime activity.
 * @returns Tailwind class name.
 */
export function getStatusTextClass(activity: FriendActivity): string {
	if (activity === "offline") {
		return "text-red-400/80";
	}

	if (activity === "waiting") {
		return "text-yellow-300";
	}

	if (activity === "playing") {
		return "text-cyan-300";
	}

	return "text-green-400";
}

/**
 * Displays a colored realtime activity dot.
 *
 * @param activity - Friend realtime activity.
 * @returns Status dot element.
 */
export function StatusDot({ activity }: { activity: FriendActivity }) {
	if (activity === "offline") {
		return (
			<span className="inline-flex size-2.5 rounded-full bg-red-400/70" />
		);
	}

	if (activity === "waiting") {
		return (
			<span className="inline-flex size-2.5 rounded-full bg-yellow-400" />
		);
	}

	if (activity === "playing") {
		return (
			<span className="relative flex size-2.5">
				<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
				<span className="relative inline-flex size-2.5 rounded-full bg-cyan-400" />
			</span>
		);
	}

	return (
		<span className="relative flex size-2.5">
			<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
			<span className="relative inline-flex size-2.5 rounded-full bg-green-400" />
		</span>
	);
}

/**
 * Displays translated realtime friend activity text.
 *
 * @param activity - Friend realtime activity.
 * @returns Translated status label.
 */
export function StatusLabel({ activity }: { activity: FriendActivity }) {
	const { t } = useTranslation();

	if (activity === "offline") {
		return <>{t("friends.status.offline")}</>;
	}

	if (activity === "available") {
		return (
			<>
				{t("friends.status.online")}
				{" · "}
				{t("friends.status.available")}
			</>
		);
	}

	if (activity === "waiting") {
		return (
			<>
				{t("friends.status.online")}
				{" · "}
				{t("friends.status.waiting")}
			</>
		);
	}

	return (
		<>
			{t("friends.status.online")}
			{" · "}
			{t("friends.status.inGame")}
		</>
	);
}
