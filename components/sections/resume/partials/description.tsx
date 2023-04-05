import { FC } from "react"

const Description:FC<{description:string[]}>=({description})=>{
    return <div className="mt-4 text-sm">
        <ul className="dark:text-primary1 text-secondary2 ">
            {description.map((line,key)=>{return <li key={key} className="list-disc">{line}</li> })}
        </ul>
    </div>
}
export default Description