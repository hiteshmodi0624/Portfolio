import { FC } from "react"

const IconWrapper: FC<{
    title?: string;
    icon: JSX.Element;
}> = ({ title, icon }) => {
    return (
        <div
            className={`relative hover:text-tertiary1 active:outline-none focus:outline-none last-of-type:pb-0
            faded-margin-v last-of-type:before:h-0 w-100 flex flex-col items-center justify-center pt-2.5
    `}
        >
            <div className="flex flex-col items-center justify-center w-12 h-12 border-2 border-tertiary1 text-tertiary1 rounded-full">
                {icon}
            </div>
            <p className="text-primary2 pt-2 text-md">{title}</p>
        </div>
    );
};
export default IconWrapper