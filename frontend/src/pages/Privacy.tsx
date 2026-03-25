import { useTranslation } from "react-i18next"

export default function Privacy() {
    const { t } = useTranslation()

    return (
        <div className="max-w-3xl mx-auto text-white p-6">
            
            <h1 className="text-3xl font-bold mb-4">
                {t("privacy.title")}
            </h1>

            <p className="mb-4">
                {t("privacy.intro")}
            </p>

            <h2 className="text-xl font-semibold mt-4">
                {t("privacy.data.title")}
            </h2>

            <ul className="list-disc ml-6">
                {(t("privacy.data.items", { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i}>
                    {item}
                </li>))}
            </ul>

            <h2 className="text-xl font-semibold mt-4">
                {t("privacy.usage.title")}
            </h2>

            <p>
                {t("privacy.usage.content")}
            </p>

            <h2 className="text-xl font-semibold mt-4">
                {t("privacy.security.title")}
            </h2>

            <p>
                {t("privacy.security.content")}
            </p>

        </div>
    )
}