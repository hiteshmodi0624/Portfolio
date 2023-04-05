import { FC } from "react";

const AboutItems:FC<{detail:{key:string,value:number|string}}>=({detail})=>{
    return (
        <li
            key={detail.key}
            className="uppercase dark:text-primary2 text-secondary1 flex justify-between p-1"
        >
            <span className="bg-tertiary2 dark:bg-tertiary1 px-2 dark:text-secondary1 text-primary2 font-bold">
                {detail.key}:
            </span>
            <span className="normal-case dark:text-primary1 text-secondary2">{detail.value}</span>
        </li>
    );
}
export default AboutItems