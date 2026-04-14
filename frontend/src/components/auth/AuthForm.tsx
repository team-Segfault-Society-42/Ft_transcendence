import { useState, useMemo } from "react"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { userService } from "@/services/userService"
import { FormField } from "../ui/FormField"

type AuthMode = "login" | "signup"

interface AuthFormProps {
    mode: AuthMode
    onSuccess?: () => void
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState(false)

    const schema = useMemo(() => {
    if (mode === "signup") {
        return z.object({
            username: z.string().min(3, { message: t("auth.errors.username") }),
            email: z.string().email({ message: t("auth.errors.email") }),
            password: z.string().min(6, { message: t("auth.errors.password") }),
      })
    }

    return z.object({
        email: z.string().email({ message: t("auth.errors.email") }),
        password: z.string().min(6, { message: t("auth.errors.password") }),
    })
    }, [mode, t])

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues:
            mode === "signup" ? { username: "", email: "", password: "" } : { email: "", password: "" },
    })

  async function onSubmit(data: any) {
    try {
        setIsLoading(true)

        if (mode === "signup") {
            await userService.createUser(data)
        }
        else {
            await userService.userLogin(data)
        }
        toast.success(t("auth.success"))
        form.reset()
        onSuccess?.()
    } 
    catch (error: any) {
        const serverMessage = error.response?.data?.message || error.message
        const finalMessage = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage
        toast.error(t("auth.error") + finalMessage)
    }
    finally {
      setIsLoading(false)
    }
}

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {mode === "signup" && (
            <FormField
            label={t("auth.username")}
            error={form.formState.errors.username}>
            <Input
                {...form.register("username")}
                placeholder={t("auth.placeholders.username")}/>
            </FormField>
      )}

        <FormField
            label={t("auth.email")}
            error={form.formState.errors.email}>
        <Input
          {...form.register("email")}
          placeholder={t("auth.placeholders.email")}/>
        </FormField>

        <FormField
            label={t("auth.password")}
            error={form.formState.errors.password}>
        <Input
            type="password"
            {...form.register("password")}
            placeholder={t("auth.placeholders.password")}/>
        </FormField>

        <Button className="w-full" disabled={isLoading}>
            {isLoading ?
            t("auth.buttons.loading") : mode === "signup" ? t("auth.buttons.register") : t("auth.buttons.login")}
        </Button>
    </form>
  )
}