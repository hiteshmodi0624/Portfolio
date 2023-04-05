import ValidateEmail from "@/util/validators";
import { ChangeEvent, Dispatch, FC, SetStateAction, useState } from "react";
const InputElement: FC<{
    name: string;
    id: string;
    textbox?: boolean;
    setInputValue: Dispatch<SetStateAction<{value:string,isInvalid:boolean,isChanged:boolean}>>;
    values: {value:string,isInvalid:boolean,isChanged:boolean};
}> = (props) => {
    const onChangeHandler = (event: ChangeEvent<{ value: string }>) => {
        const value=event.currentTarget.value;
        if(props.id==='email'){
            props.setInputValue(prev=>{return {value,isInvalid:!ValidateEmail(value),isChanged:true}})
        }
        else if(props.id==='message'){
            props.setInputValue(prev=>{return {value,isInvalid:(value.trim().length<10),isChanged:true}})
        }
        else {
            props.setInputValue(prev=>{return {value,isInvalid:(value.trim().length<2),isChanged:true}})
        }
    };
    return (
        <div className="w-full flex flex-col my-2">
            {props.textbox ? (
                <textarea
                    id={props.id}
                    name={props.id}
                    value={props.values.value}
                    onChange={onChangeHandler}
                    placeholder={props.name}
                    className={` outline-none bg-transparent border-b-2 py-2 dark:focus:border-tertiary1 focus:border-tertiary2
                                      dark:focus:placeholder:text-primary2 focus:placeholder:text-secondary1
                                      dark:focus:text-primary2 focus:text-secondary1
                                ${
                                    props.values.isInvalid && props.values.isChanged
                                        ? " border-red-600 placeholder:text-red-600 text-red-600 "
                                        : "dark:border-primary1 border-secondary2 dark:text-primary2 text-secondary1"
                                } `}
                />
            ) : (
                <input
                    id={props.id}
                    name={props.id}
                    value={props.values.value}
                    onChange={onChangeHandler}
                    placeholder={props.name}
                    className={` outline-none bg-transparent border-b-2 py-2 dark:focus:border-tertiary1 focus:border-tertiary2
                    dark:focus:placeholder:text-primary2 focus:placeholder:text-secondary1
                    dark:focus:text-primary2 focus:text-secondary1
              ${
                props.values.isInvalid && props.values.isChanged
                      ? " border-red-600 placeholder:text-red-600 text-red-600 "
                      : "dark:border-primary1 border-secondary2 dark:text-primary2 text-secondary1"
              } `}
                />
            )}
        </div>
    );
};
export default InputElement;