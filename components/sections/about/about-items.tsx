import { FC } from "react";

const AboutItems:FC<{detail:{key:string,value:number|string}}>=({detail})=>{
    return (
        <li
            key={detail.key}
            className="uppercase text-primary2 flex justify-between p-1"
        >
            <span className="bg-tertiary1 px-2 text-secondary1 font-bold">
                {detail.key}:
            </span>
            <span className="normal-case text-primary1">{detail.value}</span>
        </li>
    );
}
export default AboutItems