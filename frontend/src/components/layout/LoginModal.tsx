import { useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next"
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
	isOpen: boolean
	onClose: () => void
}


export default function LoginModal({ isOpen, onClose }: LoginModalProps) {

    const { t } = useTranslation() 
    const navigate = useNavigate()
    const loginSchema = z.object({
        email: z.string().email( { message: t("auth.errors.email")}),
        password: z.string().min(6, { message: t("auth.errors.password") }),

    })
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(data: z.infer<typeof loginSchema>) {
        try {
            setIsLoading(true)
            await userService.userLogin(data)
            navigate("/")
            toast.success(t("auth.success"), { position: "top-left" })
            form.reset()
            setTimeout(() => {onClose();}, 500 )
        } catch (error: any) {
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
  						    name="email"
  						    render={({ field }) => (
    					    <FormItem>
      					    <FormLabel>
							    {t("auth.email")}
						    </FormLabel>
      					    <FormControl>
        				    <Input placeholder={t("auth.placeholders.email")} className="bg-slate-800 border-slate-700 focus:border-cyan-500" {...field} />
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
						    <Input type='password' placeholder={t("auth.placeholders.password")} className="bg-slate-800 border-slate-700 focus:border-cyan-500" {...field} />
      					    </FormControl>
     					    <FormMessage />
    					    </FormItem>
  						    )}
					    />
        				    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-6 rounded-xl transition-all" disabled={isLoading}>
            			    {isLoading ? t("auth.buttons.loading") : t("auth.buttons.login")}
        				    </Button>
    				    </form>
			        </Form>
	        </DialogContent>
        </Dialog>
	);
}