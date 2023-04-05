import InputElement from "@/components/ui/input-element";
import { FC, FormEvent, useEffect, useState } from "react";
import { BsArrowRight } from "react-icons/bs";

const Form: FC<{
    onSubmitHandler: (email:string,name:string,message:string) => Promise<string>;
}> = ({ onSubmitHandler }) => {
    const [email, setEmail] = useState<{ value: string; isInvalid: boolean;isChanged: boolean }>({
        value: "",
        isInvalid: true,
        isChanged: false
    });
    const [name, setName] = useState<{ value: string; isInvalid: boolean;isChanged: boolean }>({
        value: "",
        isInvalid: true,
        isChanged: false
    });
    const [message, setMessage] = useState<{
        value: string;
        isInvalid: boolean;
        isChanged: boolean
    }>({ value: "", isInvalid: true, isChanged: false});


    const onSubmit=(event:FormEvent)=>{
        event.preventDefault();
        if (!email.isInvalid && !name.isInvalid && !message.isInvalid){
            onSubmitHandler(email.value, name.value, message.value).then(()=>{
                setEmail({value:"",isInvalid:true,isChanged: false})
                setName({value:"",isInvalid:true,isChanged: false})
                setMessage({value:"",isInvalid:true,isChanged: false})
            }).catch(err=>{
                console.log(err)
            })
        }
        else{
            setEmail(prev=>{return {...prev,isChanged:true}})
            setName(prev=>{return {...prev,isChanged:true}})
            setMessage(prev=>{return {...prev,isChanged:true}})
        }
    }
    
    return (
        <>
            <form className="flex justify-center my-6 mx-2" onSubmit={onSubmit}>
                <div className="flex flex-col w-full">
                    <div className="lg:grid grid-cols-2 gap-2 w-full">
                        <InputElement
                            id="email"
                            name="Your Email"
                            setInputValue={setEmail}
                            values={email}
                        />
                        <InputElement
                            id="name"
                            name="Your Name"
                            setInputValue={setName}
                            values={name}
                        />
                    </div>
                    <InputElement
                        id="message"
                        name="Your Message"
                        textbox={true}
                        setInputValue={setMessage}
                        values={message}
                    />
                    <div className="flex justify-start w-full pt-4">
                        <button
                            type="submit"
                            disabled={(email.isInvalid&&email.isChanged)||(name.isInvalid&&name.isChanged)||(message.isInvalid&&message.isChanged)}
                            className="flex items-center group space-x-2 enabled:hover:text-tertiary2 enabled:dark:hover:text-tertiary1 
                            active:translate-y-0.5 duration-500  disabled:cursor-not-allowed disabled:opacity-25"
                        >
                            <span>Send Message</span>
                            <BsArrowRight className="group-hover:translate-x-2 duration-500" />
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};
export default Form;
