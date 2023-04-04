import { FC } from "react"

const Time:FC<{time:string,current:boolean}>=({time,current})=>{
    let c="text-primary1";
    if(current){
        c="text-tertiary1"
    }
    return <div className={`${c} mt-6`}>
        <p className="border-current border-2 w-max p-1 text-xs">{time}</p>
    </div>
}
export default Time