import { UsersRound } from "lucide-react"
import { EmptyStateCard } from "@/components/ui/EmptyCard"
import { useTranslation } from "react-i18next"
import { useOutletContext } from "react-router"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router-dom"

interface User {
    username: string
    avatar?: string
    bio?: string
    wins?: number
    losses?: number
    draws?: number
    xp?: number
}

export default function Friends(){
    const { t } = useTranslation()
    const [user] = useOutletContext<[User | null]>()
    const navigate = useNavigate()

    if (!user){
        return (
            <section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
                <EmptyStateCard
                title={t("friends.title")}
                icon={<UsersRound size={24} />}
                message={t("friends.notConnected")}
                description={t("friends.login")}
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
        )
    }
}