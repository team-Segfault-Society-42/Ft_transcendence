import { useState } from 'react'
import { userService } from '../../services/userService'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,} from "@/components/ui/dialog";


export default function SignupModal(props) {

    const formSchema = z.object({
        username: z.string().min(3, "The username must be longer than 3 characters."), // add here error message in all language
        email: z.string().email("Invalid email adress."),
        password: z.string().min(8, "The password must be 8 characters"),
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
    const [isSuccess, setIsSuccess] = useState(false)

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
			setIsLoading(true)
            await userService.createUser(data)
            toast.success("User successfully created!", {position: "top-left" })
            setIsSuccess(true)
            setTimeout(() => {props.onClose();}, 2000 )

        } catch(error: any){
            toast.error("Error : " + error.message, { position: "bottom-right" })
        } finally {
            setIsLoading(false)
        }
    }

return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
       <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-800 text-white">
			<DialogHeader>
				<DialogTitle className="text-2xl font-bold text-cyan-600">Segfault Society</DialogTitle>
				<DialogDescription className="text-slate-300">
					Create your account 
				</DialogDescription>
			</DialogHeader>
				<Form {...form}>
    				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
  						control={form.control}
  						name="username"
  						render={({ field }) => (
    					<FormItem>
      					<FormLabel>Username</FormLabel>
      					<FormControl>
        				<Input placeholder="Enter your username" className="bg-slate-800 border-slate-700 focus:border-cyan-500" {...field} />
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
      					<FormLabel>Email</FormLabel>
      					<FormControl>
        				<Input type='email' placeholder="exemple@42.ch" className="bg-slate-800 border-slate-700 focus:border-cyan-500" {...field} />
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
      					<FormLabel>Password</FormLabel>
      					<FormControl>
						<Input type='password' placeholder="Qwertzuiop42#" className="bg-slate-800 border-slate-700 focus:border-cyan-500" {...field} />
      					</FormControl>
     					 <FormMessage />
    					</FormItem>
  						)}
					/>
					
        				<Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-6 rounded-xl transition-all" disabled={isLoading}>
            			{isLoading ? "Connection to server..." : "REGISTER"}
        				</Button>
						<Button type="button" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-6 rounded-xl transition-all" disabled={isLoading}>
            			{"CHANGE METHOD"}
        				</Button>
    				</form>
			</Form>

	   </DialogContent>
    </Dialog>
);


}