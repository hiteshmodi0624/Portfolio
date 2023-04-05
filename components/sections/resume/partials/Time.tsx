import { FC } from "react"

const Time:FC<{time:string,current:boolean}>=({time,current})=>{
    let c="dark:text-primary1 text-secondary2";
    if(current){
        c="dark:text-tertiary1 text-tertiary2"
    }
    return <div className={`${c} mt-6`}>
        <p className="border-current border-2 w-max p-1 text-xs">{time}</p>
    </div>
}
export default Time