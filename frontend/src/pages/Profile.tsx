// import avatarImg from "/avatar.png"
import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useOutletContext } from "react-router";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate } from 'react-router-dom';
import { Avatar } from "@/components/ui/Avatar";
import type { Match } from "@/lib/match";
import { Winrate } from "@/components/ui/Winrate";
import { LevelProgress } from "@/components/ui/Level";

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

export default function Profile() {
  const { t } = useTranslation();
  const [user, setUser] =
    useOutletContext<
      [User | null, React.Dispatch<React.SetStateAction<User | null>>]
    >();
  const [matches, setMatches] = useState<Match[]>([]);

  const [isEdit, isInEdit] = useState(false);
  const [userName, setUserName] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [loading, setLoading] = useState(true);
  //   const navigate = useNavigate()

  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUserName(user.username);
      setBio(user.bio);

      async function fetchhistory() {
        try {
          const data = await userService.getUserHistory(user!.id);
          setMatches(data);
        } catch (error) {
          console.error("Failed to fetch history:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchhistory();
    }
  }, [user]);

  // DEBUG
  console.log(matches);

  if (!user || loading) {
    return (
      <div className="flex justify-center mt-20">
        <Spinner variant="cyan" size="lg" />
      </div>
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
      toast.success("2FA setup started");
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

  return (
    <section className="w-full flex justify-center">
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
        {/* GLOW BACKGROUND */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

        {/* HEADER */}
        <div className="relative flex flex-col items-center gap-4">
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

          {/* USERNAME */}
          {isEdit ? (
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-center"
            />
          ) : (
            <h1 className="text-2xl font-bold tracking-wide">
              {user.username}
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

        {/* BIO */}
        <div className="mt-8">
          <p className="text-white/50 text-sm mb-2">{t("profile.bio")}</p>

          {isEdit ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-transparent border border-white/20 rounded px-3 py-2 focus:outline-none focus:border-cyan-400 transition resize-none"
              rows={3}
            />
          ) : (
            <p className="text-sm leading-relaxed text-white/80">{user.bio}</p>
          )}
        </div>
        {/* 2FA */}
        <div className="mt-8">
          <p className="text-white/50 text-sm mb-2">
            Two-Factor Authentication
          </p>

          {user.isTwoFactorEnabled ? (
            <div className="bg-white/5 rounded-lg py-4 px-4 border border-white/10">
              <p className="text-sm text-green-400 font-medium">
                2FA is enabled on your account.
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
                {isTwoFactorLoading ? "Loading..." : "Enable 2FA"}
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
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />

                  <Button
                    type="button"
                    onClick={handleVerifyTwoFactor}
                    disabled={isTwoFactorLoading || twoFactorCode.length !== 6}
                    className="w-full"
                  >
                    {isTwoFactorLoading ? "Verifying..." : "Verify 2FA"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleEnableTwoFactor}
                    disabled={isTwoFactorLoading}
                    className="w-full"
                  >
                    Regenerate QR
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BUTTON */}
        <Button onClick={handleSave} className="mt-8">
          {isEdit ? t("profile.buttons.save") : t("profile.buttons.edit")}
        </Button>
      </div>
    </section>
  );
}
