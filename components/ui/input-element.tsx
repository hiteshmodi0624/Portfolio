import ValidateEmail from "@/util/validators";
import { ChangeEvent, Dispatch, FC, SetStateAction, useState } from "react";
const InputElement: FC<{
    name: string;
    id: string;
    textbox?: boolean;
    setInputValue: Dispatch<SetStateAction<{value:string,isInvalid:boolean}>>;
    value: string;
}> = (props) => {
    const [isInvalid,setInvalid]=useState<boolean>(false);
    const onChangeHandler = (event: ChangeEvent<{ value: string }>) => {
        const value=event.currentTarget.value;
        if(props.id==='email'){
            setInvalid(!ValidateEmail(value))
        }
        else if(props.id==='message'){
            setInvalid(value.trim().length<10);
        }
        else {
            setInvalid(value.trim().length<3);
        }
        props.setInputValue({value,isInvalid});
    };
    return (
        <div className="w-full flex flex-col my-2">
            {props.textbox ? (
                <textarea
                    id={props.id}
                    name={props.id}
                    value={props.value}
                    onChange={onChangeHandler}
                    placeholder={props.name}
                    className={` outline-none bg-transparent border-b-2 py-2 border-primary1 focus:border-tertiary1 text-primary2 focus:placeholder:text-primary2 focus:text-primary2
                                ${isInvalid&&" border-red-600 placeholder:text-red-600 text-red-600"} `}
                />
            ) : (
                <input
                    id={props.id}
                    name={props.id}
                    value={props.value}
                    onChange={onChangeHandler}
                    placeholder={props.name}
                    className={` outline-none bg-transparent border-b-2 py-2 border-primary1 focus:border-tertiary1 text-primary2 focus:placeholder:text-primary2 focus:text-primary2
                                ${isInvalid&&" border-red-600 placeholder:text-red-600 text-red-600"} `}
                />
            )}
        </div>
    );
};
export default InputElement;