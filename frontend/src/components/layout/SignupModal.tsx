import { useState } from 'react'
import { userService } from '../../services/userService'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button"
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next"

interface SignupModalProps {
	isOpen: boolean
	onClose: () => void
	onSwitchToSignin: () => void
}

export default function SignupModal({ isOpen, onClose, onSwitchToSignin }: SignupModalProps) {

	const { t } = useTranslation()

	const formSchema = z.object({
		username: z.string().min(3, { message: t("auth.errors.username") }),
		email: z.string().email({ message: t("auth.errors.email") }),
		password: z.string().min(6, { message: t("auth.errors.password") }),
	})	
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    })

    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
			setIsLoading(true)
            await userService.createUser(data)
            toast.success(t("auth.success"), {position: "top-left" })
			form.reset()
            setTimeout(() => {onClose();}, 2000 )

        } catch(error: any){
			const serverMessage = error.response?.data?.message || error.message
			const finalMessage = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage
            toast.error(t("auth.error") + finalMessage, { position: "bottom-right" })
        } finally {
            setIsLoading(false)
        }
    }

return (
    <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className="sm:max-w-106.25 bg-slate-800 border-slate-800 text-white">
			<DialogHeader>
				<DialogTitle className="text-2xl font-bold text-cyan-600">
					{t("auth.title")}
				</DialogTitle>
				<DialogDescription className="text-slate-300">
					{t("auth.description")}
				</DialogDescription>
			</DialogHeader>
				<Form {...form}>
    				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
  						control={form.control}
  						name="username"
  						render={({ field }) => (
    					<FormItem>
      					<FormLabel>
							{t("auth.username")}
						</FormLabel>
      					<FormControl>
        				<Input 
							placeholder={t("auth.placeholders.username")}
							{...field} />
      					</FormControl>
     					 <FormMessage />
    					</FormItem>
  						)}
					/>
					<FormField
  						control={form.control}
  						name="email"
  						render={({ field }) => (
    					<FormItem>
      					<FormLabel>
							{t("auth.email")}
						</FormLabel>
      					<FormControl>
        				<Input
							type='email'
							placeholder={t("auth.placeholders.email")}
							{...field} />
      					</FormControl>
     					 <FormMessage />
    					</FormItem>
  						)}
					/>
						<FormField
  						control={form.control}
  						name="password"
  						render={({ field }) => (
    					<FormItem>
      					<FormLabel>
							{t("auth.password")}
						</FormLabel>
      					<FormControl>
						<Input
							type='password'
							placeholder={t("auth.placeholders.password")}
							{...field} />
      					</FormControl>
     					 <FormMessage />
    					</FormItem>
  						)}
					/>
        				<Button
							className="w-full"
							size="lg"
							disabled={isLoading}>
            				{isLoading ? t("auth.buttons.loading") : t("auth.buttons.register")}
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={onSwitchToSignin}>
							{ t("auth.buttons.already_account") } 
						</Button>
    				</form>
			</Form>
	   </DialogContent>
    </Dialog>
	);
}