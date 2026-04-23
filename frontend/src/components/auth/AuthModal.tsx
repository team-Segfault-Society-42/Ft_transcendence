import { useTranslation } from "react-i18next"
import { AuthForm } from "./AuthForm"
import { Button } from "@/components/ui/Button"

type AuthMode = "login" | "signup"

interface AuthModalProps {
    mode: AuthMode
    isOpen: boolean
    onClose: () => void
    onSwitchMode: () => void
    onSuccess?: () => void
}

export function AuthModal({
    mode,
    isOpen,
    onClose,
    onSwitchMode,
    onSuccess,
} : AuthModalProps) {

    const { t } = useTranslation()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

        {/* Overlay */}
        <div
            className="absolute inset-0 bg-black/60 backdrop-blur"
            onClick={onClose}/>

        {/* Modal */}
        <div className="relative z-10 w-full max-w-md bg-slate-800 p-6 rounded-2xl border border-white/10">

        <h2 className="text-2xl mb-2 bg-linear-to-br from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          {mode === "signup" ? t("auth.description") : t("auth.description_login")}
        </h2>

        <AuthForm
          mode={mode}
          onSuccess={() => 
          { onClose()
            onSuccess?.()
          }}/>

        <Button
          type="button"
          variant="secondary"
          className="w-full mt-4"
          onClick={onSwitchMode}>
          {mode === "signup" ? t("auth.buttons.already_account") : t("auth.buttons.no_account")}
        </Button>

      </div>
    </div>
  )
}