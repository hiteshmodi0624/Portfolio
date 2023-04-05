import { work } from "@/data/projects"
import Image from "next/image"
import Link from "next/link"
import { FC } from "react"

const Work:FC<{work:work}>=({work})=>{
    var bg='';
    if(work.background==='light')
        bg='bg-primary1 border-primary1'
    else
        bg='bg-secondary2 border-secondary2'
    return (
        <Link href={work.link} className={`relative rounded-full overflow-hidden h-48 w-48 flex 
                    items-center text-center justify-center border-2 hover:border-tertiary2 dark:hover:border-tertiary1  p-6 ${bg}`}>
            <Image
                src={work.image}
                height={200}
                width={200}
                alt={work.name}
                className="w-48"
            />
            <span className="absolute h-48 w-48 p-6 bg-transparent top-0 left-0 hover:bg-secondary2 uppercase
            hover:bg-opacity-95 text-2xl justify-center flex items-center dark:text-tertiary1 text-tertiary2 opacity-0 hover:opacity-100 duration-300">{work.name}</span>
        </Link>
    );
}
export default Work
