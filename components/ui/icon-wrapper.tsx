import { FC } from "react"

const IconWrapper: FC<{
    title?: string;
    icon: JSX.Element;
}> = ({ title, icon }) => {
    return (
        <div
            className={`relative dark:hover:text-tertiary1 hover:text-tertiary2 active:outline-none focus:outline-none last-of-type:pb-0
            w-100 flex flex-col items-center justify-center pt-2.5
    `}
        >
            <div className="flex flex-col items-center justify-center w-12 h-12 border-2 dark:border-tertiary1 border-tertiary2 dark:text-tertiary1 text-tertiary2 rounded-full">
                {icon}
            </div>
            <p className="text-secondary1 dark:text-primary2 pt-2 text-md">{title}</p>
        </div>
    );
};
export default IconWrapper