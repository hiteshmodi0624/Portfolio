import Heading from "@/components/typography/heading"
import Content from "@/components/ui/content"
import { FormEvent, useEffect, useState } from "react"
import Form from "./form"
import Notification from "@/components/ui/notification"


const ContactForm=()=>{
    const [status,setStatus]=useState<string|null>(null);
    useEffect(()=>{
        if(status==="success"||status==="error"){
            const timer=setTimeout(()=>{
                setStatus(null)
            },3000)
            return ()=>{
                clearTimeout(timer);
            }
        }
    },[status])
    const onSubmitHandler=async(email:string,name:string,message:string)=>{
        try {
            setStatus("pending")
            const response = await fetch("/api/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({email,name,message}),
            });
            if (response.ok) {
                setStatus("success")
                return Promise.resolve("Successfull")
            } else {
                setStatus("error")
                return Promise.reject(await response.text())
            }
          } catch (error:any) {
                setStatus("error")
                return Promise.reject(error.message)
          }
    }   
    var notification:JSX.Element|null=null;
    if(status==="pending")
        notification=(<Notification title="Sending Message" status="pending"/>)
    if(status==="success")
        notification=(<Notification title="Your message was sent successfully" status="success"/>)
    if(status==="error")
        notification=(<Notification title="There was an error sending the message. Please try again in sometime!" status="error"/>)
    return (
        <section id="contact">
            {notification}
            <Heading title="Contact Me"/>
            <Content>
            <Form onSubmitHandler={onSubmitHandler}/>
            </Content>
        </section>
    );
}
export default ContactForm