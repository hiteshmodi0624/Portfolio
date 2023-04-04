import { FC } from "react"

const Company:FC<{company:string,location:string}>=({company,location})=>{
    return <div className="">
        <h3 className="text-primary1 ">{company} - ({location})</h3>
    </div>
}
export default Company