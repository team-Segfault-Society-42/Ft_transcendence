// import avatarImg from "/avatar.png"
import { useEffect, useState, useRef } from "react";
import { userService } from "../services/userService";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
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
import { useNavigate } from "react-router-dom";
import { AchievementIcon } from "@/components/ui/AchievementIcons";
import { CardTitle } from "@/components/ui/Card";

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

export default function Profile() {
  const { t } = useTranslation();
  const [user, setUser] =
    useOutletContext<
      [User | null, React.Dispatch<React.SetStateAction<User | null>>]
    >();

  const [isEdit, isInEdit] = useState(false);
  const [userName, setUserName] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [loading, setLoading] = useState(true);

  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);

  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);
  const navigate = useNavigate()

	const [isAvatarUploading, setIsAvatarUploading] = useState(false);
	const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setUserName(user.username);
      setBio(user.bio);

      async function fetchAllAchievments() {
        try {
          const data = await userService.getAllAchievements()
          setAllAchievements(data)
        } catch (error) {
          console.error("Failed to fetch all achievements: ", error)
        }
      }
      fetchAllAchievments()

      async function fetchAchievements() {
        try {
          const data = await userService.getAchievements(user!.id)
          if (Array.isArray(data)) {
            setUnlockedAchievements(data.map((a: any) => a.achievementId || a));
          }
        } catch (error) {
          console.error("Failed to fetch achievements: ", error)
        }
      }
      fetchAchievements()

      setLoading(false);
    }
  }, [user]);

  if (!user || loading) {
    return (
      <section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
        <EmptyStateCard
          title={t("profile.about.title")}
          icon={<span className="text-xl font-bold">?</span>}
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

  async function handleSave() {
    if (!user) return;
    if (isEdit) {
      try {
        await userService.updateUser(user.id, { username: userName, bio: bio });
        setUser({ ...user, username: userName, bio: bio });
        toast.info(t("auth.buttons.edit"));
      } catch (error: any) {
        const serverMessage = error.response?.data?.message || error.message;
        const finalMessage = Array.isArray(serverMessage)
          ? serverMessage[0]
          : serverMessage;
        toast.error(t("auth.error") + finalMessage);
      }
    }
    isInEdit(!isEdit);
  }

  async function handleEnableTwoFactor() {
    if (!user) return;

    try {
      setIsTwoFactorLoading(true);
      const result = await userService.enableTwoFactor();
      setQrCodeDataUrl(result.qrCodeDataUrl);
      toast.success(t("auth.twofa.setupStarted"));
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || error.message;
      const finalMessage = Array.isArray(serverMessage)
        ? serverMessage[0]
        : serverMessage;
      toast.error(t("auth.error") + finalMessage);
    } finally {
      setIsTwoFactorLoading(false);
    }
  }

  async function handleVerifyTwoFactor() {
    if (!user) return;

    try {
      setIsTwoFactorLoading(true);
      const result = await userService.verifyTwoFactorSetup(twoFactorCode);
      toast.success(result.message);

      const refreshedUser = await userService.getMe();
      setUser(refreshedUser);

      setTwoFactorCode("");
      setQrCodeDataUrl("");
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || error.message;
      const finalMessage = Array.isArray(serverMessage)
        ? serverMessage[0]
        : serverMessage;
      toast.error(t("auth.error") + finalMessage);
    } finally {
      setIsTwoFactorLoading(false);
    }
  }

	async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
		if (!user) return;

		const file = event.target.files?.[0];

		if (!file) return;

		try {
			setIsAvatarUploading(true);

			const updatedUser = await userService.uploadAvatar(file);
			setUser({ ...user, avatar: updatedUser.avatar });

			toast.success(t("profile.avatarUpdated"));
		} catch (error: any) {
			const serverMessage = error.response?.data?.message || error.message;
			const finalMessage = Array.isArray(serverMessage)
				? serverMessage[0]
				: serverMessage;

			toast.error(t("auth.error") + finalMessage);
		} finally {
			setIsAvatarUploading(false);
			event.target.value = "";
		}
	}

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
              src={user.avatar}
              alt={user.username}
              size="lg"
              className="border border-white/20 z-10 relative"
            />
            <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-md opacity-0 group-hover:opacity-100 transition"></div>
            </div>
			{isEdit && (
				<div className="mt-3 flex justify-center">
					<input
						ref={avatarInputRef}
						type="file"
						accept="image/png,image/jpeg,image/webp"
						onChange={handleAvatarUpload}
						disabled={isAvatarUploading}
						className="hidden"
					/>

					<Button
						type="button"
						variant="secondary"
						onClick={() => avatarInputRef.current?.click()}
						disabled={isAvatarUploading}
						className="px-4 py-2 text-xs"
					>
						{isAvatarUploading
            ? t("profile.uploading")
            : t("profile.changeAvatar")}
					</Button>
				</div>
			)}

          {/* USERNAME */}
          {isEdit ? (
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-center"
            />
          ) : (
            <h1 className="text-2xl font-bold tracking-wide">
              <Username name={user.username} variant="profile" />
            </h1>
          )}
        </div>

        {/* STATS */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          {[
            { label: t("profile.stats.wins"), value: user.wins },
            { label: t("profile.stats.losses"), value: user.losses },
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
        <Winrate wins={user.wins} losses={user.losses} draws={user.draws} />

        {/* Level */}
        <LevelProgress xp={user.xp} />

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
                    <p className="font-bold text-cyan-400">{ach.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BIO */}
        <div className="mt-8">
          <p className="text-white/50 text-sm mb-2">
            {t("profile.bio")}
          </p>

          <div className="w-full min-h-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition focus-within:border-cyan-400">
            {isEdit ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-transparent focus:outline-none resize-none text-sm text-white/80"
            />
          ) : user.bio ? (
                <p className="text-sm leading-relaxed text-white/80">
                  {user.bio}
                </p>
          ) : (
            <p className="text-sm text-white/30 italic">
                {t("profile.emptyBio")}
            </p>
          )}
            </div>          
        </div>

        {/* BUTTON */}
        <Button onClick={handleSave} className="mt-8 w-full flex justify-center">
          {isEdit ? t("profile.buttons.save") : t("profile.buttons.edit")}
        </Button>

        {/* 2FA */}
        <div className="mt-8">
          <p className="text-white/50 text-sm mb-2">{t("auth.twofa.title")}</p>

          {user.isTwoFactorEnabled ? (
            <div className="bg-white/5 rounded-lg py-4 px-4 border border-white/10">
              <p className="text-sm text-green-400 font-medium">
                {t("auth.twofa.enabled")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleEnableTwoFactor}
                disabled={isTwoFactorLoading}
                className="w-full"
              >
                {isTwoFactorLoading
                  ? t("auth.twofa.loading")
                  : t("auth.twofa.enable")}
              </Button>

              {qrCodeDataUrl && (
                <div className="bg-white/5 rounded-lg py-4 px-4 border border-white/10 space-y-4">
                  <img
                    src={qrCodeDataUrl}
                    alt="2FA QR code"
                    className="mx-auto rounded-lg bg-white p-2"
                  />

                  <Input
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder={t("auth.twofa.enterCode")}
                    maxLength={6}
                  />

                  <Button
                    type="button"
                    onClick={handleVerifyTwoFactor}
                    disabled={isTwoFactorLoading || twoFactorCode.length !== 6}
                    className="w-full"
                  >
                    {isTwoFactorLoading
                      ? t("auth.twofa.verifying")
                      : t("auth.twofa.verify")}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleEnableTwoFactor}
                    disabled={isTwoFactorLoading}
                    className="w-full"
                  >
                    {t("auth.twofa.regenerate")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
