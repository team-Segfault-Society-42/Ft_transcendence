// import avatarImg from "/avatar.png"
import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { useOutletContext } from "react-router";
import { toast } from "sonner";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate } from 'react-router-dom';
import { Avatar } from "@/components/ui/Avatar";
import { Winrate } from "@/components/ui/Winrate";
import { LevelProgress } from "@/components/ui/Level";
import { Username } from "@/components/ui/Username";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { useNavigate, useParams } from "react-router-dom";
import { AchievementIcon } from "@/components/ui/AchievementIcons";
import { CardTitle } from "@/components/ui/Card";
import { UserRound } from "lucide-react";
import { friendsService } from "@/services/friendsService";
import { useFriendsStore } from "@/Store/friendsStore";
import { getBackendErrorMessage } from "../utils/getBackendErrorMessage";

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

interface Achievement {
  key: string;
  displayName: string;
  description: string;
  iconName: string;
}

interface UserAchievement {
  achievementId: string
}

type RelationshipState = "SELF" | "FRIEND" | "PENDING_SENT" | "PENDING_RECEIVED" | "NONE"

export default function Profile() {
  const { t } = useTranslation();
  const [user] =
    useOutletContext<
      [User | null, React.Dispatch<React.SetStateAction<User | null>>]
    >();

  const { username } = useParams<{ username: string }>()
  const isMe = !username || username === user?.username
  const [profileData, setProfileData] = useState<User | null>(isMe ? user : null)


	const friends = useFriendsStore((state) => state.friends);
	const incomingRequests = useFriendsStore(
		(state) => state.incomingRequests,
	);
	const outgoingRequests = useFriendsStore(
		(state) => state.outgoingRequests,
	);
	const loadFriendsData = useFriendsStore(
		(state) => state.loadFriendsData,
	);

  const [loading, setLoading] = useState(true);

  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [rank, setRank] = useState<number | null>(null)

  const navigate = useNavigate()



  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      if (isMe) {
        setProfileData(user)
        setLoading(false)
      }
      else if (username) {
        if (!user) return
        try {
          setLoading(true)
          const data = await userService.getUserByUsername(username)
          setProfileData(data)
          setLoading(false)
        }
        catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Failed to load profile:", error.message);
          } else {
            console.error("Failed to load profile: An unknown error occurred");
          }
          navigate("/dashboard");
        }
      }
    }
    loadProfile()
  }, [username, user, isMe])

  function getRelationshipState(): RelationshipState  {
    if (user && profileData?.id === user.id) {
      return "SELF";
    }
    if (friends.some((item) => item.friend.id === profileData?.id)) {
      return "FRIEND";
    }
    if (outgoingRequests.some((request) => request.receiver.id === profileData?.id)) {
      return "PENDING_SENT";
    }
    if (incomingRequests.some((request) => request.sender.id === profileData?.id)) {
      return "PENDING_RECEIVED";
    }
    return "NONE";
	}



  async function handleSendRequest() {
    if (!profileData) return;

    try {
      await friendsService.sendFriendRequest(profileData.id)
      toast.success(t("friends.success.requestSent"))
      await loadFriendsData()
    } catch (error: unknown) {
		const finalMessage = getBackendErrorMessage(error);

		toast.error(
			t(`backend.${finalMessage}`, {
				defaultValue: finalMessage,
			}),
		);
	}
  }

  async function handleAcceptRequest() {
    if (!profileData) return;

    const request = incomingRequests.find((r) => r.sender.id === profileData.id)

    if (!request) return

    try {
      await friendsService.acceptFriendRequest(request.requestId)
      toast.success(t("friends.success.accepted"))
      await loadFriendsData()
    } catch (error: unknown) {
		const finalMessage = getBackendErrorMessage(error);

		toast.error(
			t(`backend.${finalMessage}`, {
				defaultValue: finalMessage,
			}),
		);
	}
  }

  async function handleRemoveFriend() {
    if (!profileData) return;

    const friendship = friends.find((item) => item.friend.id === profileData.id)
    if (!friendship) return;

    try {
      await friendsService.removeFriend(friendship.friendshipId)
      toast.success(t("friends.success.removed"));
      await loadFriendsData()
    } catch (error: unknown) {
		const finalMessage = getBackendErrorMessage(error);

		toast.error(
			t(`backend.${finalMessage}`, {
				defaultValue: finalMessage,
			}),
		);
	}
  }

  useEffect(() => {
    if (!profileData || !user) return;

      async function fetchAllAchievments() {
        try {
          const data = await userService.getAllAchievements()
          setAllAchievements(data)
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Failed to fetch all achievements:", error.message);
          } else {
            console.error("Failed to fetch all achievements: An unknown error occurred");
          }
        }
      }
      fetchAllAchievments()

      async function fetchAchievements() {
        try {
          const data = await userService.getAchievements(profileData!.id)
          if (Array.isArray(data)) {
            setUnlockedAchievements(data.map((a: UserAchievement) => a.achievementId));
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Failed to fetch achievements:", error.message);
          } else {
            console.error("Failed to fetch achievements: An unknown error occurred");
          }
        }
      }
      fetchAchievements()

      async function fetchRank() {
        try {
          const rankData = await userService.getUserRank(profileData!.id)
          setRank(rankData.rank)
			  } catch (error: unknown) {
          if (error instanceof Error) {
					  console.error('Failed to fetch user rank:', error.message);
				  } else {
					  console.error('Failed to fetch user rank: An unknown error occurred');
				  }
			  }
      }
      fetchRank()

      setLoading(false);

  }, [profileData?.id, isMe, user]);


  if (!user || loading) {
    return (
      <section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
        <EmptyStateCard
          title={t("profile.about.title")}
          icon={<UserRound size={24} />}
          message={t("profile.about.notConnected")}
          description={t("profile.about.login")}
          actions={
            <>
              <Button
                onClick={() => navigate("/")}>
                  {t("buttons.backHome")}
              </Button>
            </>
        }
        />
      </section>
    );
  }

  const state = getRelationshipState()

  return (
    <section className="w-full max-w-3xl mx-auto px-6 py-10">
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">

        <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          {t("sidebar.profile")}
        </CardTitle>

        {/* GLOW BACKGROUND */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

        {/* HEADER */}
        <div className="relative flex flex-col items-center gap-4 pt-10">
          {/* AVATAR */}
          <div className="relative group">
            <Avatar
              src={profileData?.avatar ?? undefined}
              alt={profileData?.username ?? ""}
              size="lg"
              className="border border-white/20 z-10 relative"
            />
            <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-md opacity-0 group-hover:opacity-100 transition"></div>
            </div>



          {/* USERNAME */}
          <div className="text-2xl font-bold tracking-wide">
            <Username
            name={profileData?.username ?? ""}
            variant="profile"
            />
		      </div>

          {rank && (
              <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                Rank #{rank}
              </span>
            )}

        </div>

        <div>
          {/* FRIEND BUTTON */}
          {!isMe && (
            <div className="mt-4">
              {state === "NONE" && (
                <Button onClick={handleSendRequest}>
                  {t("friends.actions.add")}
                </Button>
              )}

              {state === "PENDING_SENT" && (
                <Button disabled>
                  {t("friends.states.pending")}
                </Button>
              )}

              {state === "PENDING_RECEIVED" && (
                <Button onClick={handleAcceptRequest}>
                  {t("friends.actions.accept")}
                </Button>
              )}

              {state === "FRIEND" && (
                <Button variant="danger" onClick={handleRemoveFriend}>
                  {t("friends.actions.remove")}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { label: t("profile.stats.wins"), value: profileData?.wins },
            { label: t("profile.stats.draw"), value: profileData?.draws },
            { label: t("profile.stats.losses"), value: profileData?.losses },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-lg py-4 border border-white/10 hover:scale-105 transition"
            >
              <p className="text-xs text-white/50">{stat.label}</p>

              <p className="font-bold text-lg">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* WINRATE */}
        <Winrate wins={profileData?.wins ?? 0} losses={profileData?.losses ?? 0} draws={profileData?.draws ?? 0} />

        {/* Level */}
        <LevelProgress xp={profileData?.xp ?? 0} />

        {/* Achievements */}
        <div className="mt-8">
          <p className="text-white/50 text-sm mb-4">
            {t("profile.achievement")}
          </p>
          <div className="grid grid-cols-4 gap-4">
            {allAchievements.map((ach) => {
              const isUnlocked = unlockedAchievements.includes(ach.key);

              return (
                <div
                  key={ach.key}
                  className="group relative flex flex-col items-center"
                >
                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      isUnlocked
                        ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                        : "bg-white/5 border-white/10 opacity-30 grayscale"
                    }`}
                  >
                    <AchievementIcon
                      iconName={ach.iconName}
                      isUnlocked={isUnlocked}
                      size={24}
                    />
                  </div>

                  <div className="absolute -top-10 scale-0 group-hover:scale-110 transition-all bg-black/90 p-2 rounded text-[10px] z-50 pointer-events-none">
                    <p className="font-bold text-cyan-400">{t(`backend.ACH_${ach.key}_DESC`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BIO */}
        <div className="mt-8 wrap-break-word">
          <p className="text-white/50 text-sm mb-2 ">
            {t("profile.bio")}
          </p>


		<div className="w-full min-h-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition focus-within:border-cyan-400">
			{profileData?.bio ? (
				<p className="text-sm leading-relaxed text-white/80">
					{profileData?.bio}
				</p>
			) : isMe ? (
				<p className="text-sm text-white/30 italic">
					{t("profile.emptyBio")}
				</p>
			) : (
        <p></p>

      )}
		</div>


        </div>

        {/* BUTTON */}
        {isMe && (
			<Button
				onClick={() => navigate("/settings")}
				className="mt-8 w-full flex justify-center"
			>
				{t("profile.editProfile")}
			</Button>
		)}

      </div>
    </section>
  );
}
