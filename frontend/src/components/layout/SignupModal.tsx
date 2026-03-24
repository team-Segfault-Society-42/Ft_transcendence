import { useState } from 'react'
import { userService } from '../../services/userService'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


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
            await userService.createUser(data)
            toast.success("User successfully created!")
            setIsSuccess(true)
            setTimeout(() => {props.onClose();}, 2000 )

        } catch(error: any){
            toast.error("Error : " + error.message)
        } finally {
            setIsLoading(false)
        }
    }

return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
       
    </Dialog>
);


}