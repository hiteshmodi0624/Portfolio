import Link from "next/link"
import { FC } from "react"

const LinkIconWrapper: FC<{
    title?: string;
    noBottom?: boolean;
    icon: JSX.Element;
    link: string;
    target?:string;
}> = ({ title, noBottom, icon, link,target }) => {
    const borderBottom = noBottom ? "" : `lg:faded-margin last:after:h-0 after:bottom-0 w-full`;
    return (
        <Link
            href={link}
            className={`relative flex flex-col items-center lg:pb-2 
    hover:text-tertiary2 dark:hover:text-tertiary1  active:outline-none focus:outline-none last:pb-0 ${borderBottom} active:translate-y-0.5 duration-500`}
            target={target || "_blank"}
        >
            {icon}
            <p className="uppercase">{title}</p>
        </Link>
    );
};
export default LinkIconWrapper