import { FC } from "react"

const SubHeading:FC<{title:string}>=({title})=>{
    return <h2 className="font-bold">{title}</h2>
}
export default SubHeading