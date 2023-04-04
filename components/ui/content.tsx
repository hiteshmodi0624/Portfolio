import { FC, PropsWithChildren } from "react"

const Content:FC<PropsWithChildren<{className?:string}>>=({children,className})=>{
    return <div className={`p-6 ${className}`}>
        {children}
    </div>
}
export default Content