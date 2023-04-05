import { FC } from "react"

const Position:FC<{position:string}>=({position})=>{
    return <div className="">
        <h2 className="dark:text-primary2 text-secondary1 mt-2 font-bold">{position}</h2>
    </div>
}
export default Position