import Link from "next/link"
import { FC } from "react"

const Button:FC<{link:string, title:string, icon?:JSX.Element}>=({link,title,icon})=>{
    return<Link href={link} className="text-center py-4 uppercase text-md w-full m-auto text-primary2
     flex justify-center items-center space-x-2 group faded-margin-v relative last:before:w-0 hover:text-tertiary1" target="_blank">
        <p>{title}</p>
        <div className="group-hover:translate-x-2 duration-500">
            {icon}
        </div>
    </Link>

}
export default Button