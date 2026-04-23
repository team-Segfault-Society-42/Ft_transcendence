import { useTranslation } from "react-i18next"
import { Motion } from "@/components/ui/Motion"

export default function Terms() {
    const { t } = useTranslation()

    return (
        <div className="max-w-3xl mx-auto text-white p-6">
            <Motion>
                <h1 className="text-3xl font-bold mb-4">
                    {t("terms.title")}
                </h1>

                <p className="mb-4">
                    {t("terms.intro")}
                </p>

                <h2 className="text-xl font-semibold mt-4">
                    {t("terms.usage.title")}
                </h2>

                <p>
                    {t("terms.usage.content")}
                </p>

                <h2 className="text-xl font-semibold mt-4">
                    {t("terms.account.title")}
                </h2>

                <p>
                    {t("terms.account.content")}
                </p>

                <h2 className="text-xl font-semibold mt-4">
                    {t("terms.limitation.title")}
                </h2>

                <p>
                    {t("terms.limitation.content")}
                </p>
            </Motion>
        </div>
    )
}