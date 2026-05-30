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
import { getBackendErrorMessage } from "../../utils/getBackendErrorMessage"

type AuthMode = "login" | "signup"

type LoginFormValues = {
	email: string;
	password: string;
};

type SignupFormValues = LoginFormValues & {
	username: string;
};

type AuthFormValues = LoginFormValues | SignupFormValues;

interface AuthFormProps {
    mode: AuthMode
    onSuccess?: () => void
	onTwoFactorRequired?: () => void;
}

export function AuthForm({ mode, onSuccess, onTwoFactorRequired, }: AuthFormProps) {
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

	function isSignupFormValues(
		mode: AuthMode,
	): boolean {
		return mode === "signup";
	}

	async function onSubmit(data: AuthFormValues) {
		try {
			setIsLoading(true);

			if (isSignupFormValues(mode)) {
				const signupData = data as SignupFormValues;

				await userService.createUser({
					username: signupData.username,
					email: signupData.email,
					password: signupData.password,
				});

				toast.success(t("auth.success"));
				form.reset();
				onSuccess?.();
				return;
			}

			const result = await userService.userLogin({
				email: data.email,
				password: data.password,
			});

			if (result.twoFactorRequired) {
				toast.info(t("auth.twofa.loginPrompt"));
				form.reset();
				onTwoFactorRequired?.();
				return;
			}

			form.reset();
			onSuccess?.();
		} catch (error: unknown) {
			const finalMessage = getBackendErrorMessage(error);

			toast.error(
				t(`backend.${finalMessage}`, {
					defaultValue: finalMessage,
				}),
			);
		} finally {
			setIsLoading(false);
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
