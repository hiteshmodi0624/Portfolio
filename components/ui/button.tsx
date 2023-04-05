import Link from "next/link"
import { FC } from "react"

const Button: FC<{ link: string; title: string; icon?: JSX.Element,target?:string }> = ({
    link,
    title,
    icon,
    target,
}) => {
    return (
        <Link
            href={link}
            className="text-center py-4 uppercase text-md w-full m-auto text-secondary1 dark:text-primary2 
     flex justify-center items-center space-x-2 group faded-margin-v relative last:before:w-0 dark:hover:text-tertiary1
      hover:text-tertiary2 active:translate-y-0.5 duration-500"
            target={target || "_blank"}
        >
            <p>{title}</p>
            <div className="group-hover:translate-x-2 duration-500">{icon}</div>
        </Link>
    );
};
export default Button