import { FC } from "react"

const Heading:FC<{title:string}>=({title})=>{
    return <h1 className="text-xl text-primary2 font-bold faded-margin 
    after:bottom-0 w-full p-6 h-max relative after:rotate-180 
    before:absolute before:left-4 before:top-7 before:h-7 before:w-7 before:rounded-full before:bg-gradient-to-br from-tertiary1 to-tertiary2
    before:opacity-25 after:right-0
    "><span className="text-tertiary1">{title[0]}</span>{title.substring(1)}</h1>
}
export default Heading