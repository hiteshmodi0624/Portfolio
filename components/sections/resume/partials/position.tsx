import { FC } from "react"

const Position:FC<{position:string}>=({position})=>{
    return <div className="">
        <h2 className="text-primary2 mt-2 font-bold">{position}</h2>
    </div>
}
export default Position