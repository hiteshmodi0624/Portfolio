import Heading from "@/components/typography/heading"
import Button from "@/components/ui/button"
import Content from "@/components/ui/content"
import InputElement from "@/components/ui/input-element"
import { FormEvent, useContext, useState } from "react"
import { BsArrowRight } from "react-icons/bs"


const ContactForm=()=>{
    const [email,setEmail]=useState<{value:string,isInvalid:boolean}>({value:"",isInvalid:true})
    const [name,setName]=useState<{value:string,isInvalid:boolean}>({value:"",isInvalid:true})
    const [message,setMessage]=useState<{value:string,isInvalid:boolean}>({value:"",isInvalid:true})
    const onSubmitHandler=async(event:FormEvent)=>{
    }
    return (
        <section id="contact">
            <Heading title="Contact Me"/>
            <Content>
                <form
                    className="flex justify-center my-6 mx-2"
                    onSubmit={onSubmitHandler}
                >
                    <div className="flex flex-col w-full">
                        <div className="lg:grid grid-cols-2 gap-2 w-full">
                            <InputElement
                                id="email"
                                name="Your Email"
                                setInputValue={setEmail}
                                value={email.value}
                            />
                            <InputElement
                                id="name"
                                name="Your Name"
                                setInputValue={setName}
                                value={name.value}
                            />
                        </div>
                        <InputElement
                            id="message"
                            name="Your Message"
                            textbox={true}
                            setInputValue={setMessage}
                            value={message.value}
                        />
                        <div className="flex justify-end w-full pt-4">
                            <Button
                                link="#"
                                title="Send Message"
                                icon={<BsArrowRight />}
                            />
                        </div>
                    </div>
                </form>
            </Content>
        </section>
    );
}
export default ContactForm