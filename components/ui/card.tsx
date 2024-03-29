import { FC, PropsWithChildren } from "react"

const Card:FC<PropsWithChildren<{className?:string}>>=({children,className})=>{
    return <div className={`bg-primary2 dark:bg-secondary1 rounded-md p-0 m-0  ${className}`}>
        {children}
    </div>
}
export default Card