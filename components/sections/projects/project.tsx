import { project } from "@/data/projects"
import Link from "next/link"
import { FC } from "react"
import { BsGithub } from "react-icons/bs";

const Project:FC<{project:project}>=({project})=>{
    return (
        <Link href={project.link} className="dark:bg-secondary2 bg-primary1 p-8 rounded-md" target="_blank">
            <div className="dark:text-primary2 text-secondary1 flex items-center">
                <div className="mr-2">
                    <BsGithub />
                </div>
                <h3>{project.title}</h3>
            </div>
            <ul className="flex flex-wrap mt-2">
                {project.hashtags?.map((hashtag) => (
                    <li
                        key={hashtag}
                        className="rounded-full bg-gray-800 text-primary1  inline px-3 py-0.5 text-sm my-1 mr-1"
                    >
                        #{hashtag}
                    </li>
                ))}
            </ul>
            <p className="dark:text-primary1 text-secondary2 text-sm mt-2">
                {project.description}
            </p>
        </Link>
    );
}
export default Project