import SubHeading from "@/components/typography/sub-heading";
import IconWrapper from "@/components/ui/icon-wrapper"
import { IconContext } from "react-icons"
import Time from "./partials/Time";
import Position from "./partials/position";
import Company from "./partials/company";
import Description from "./partials/description";
import { FC } from "react";
const Experiences: FC<{
    data: {
        company: string;
        position: string;
        time: string;
        description: string[];
        current: boolean;
        location: string;
    }[];
    title:string;
    icon:JSX.Element
}> = ({ data,title,icon }) => {
    return (
        <div className=" faded-margin-v relative">
            <div className="flex items-center faded-margin after:bottom-0 relative after:rotate-180 pl-2">
                <IconContext.Provider
                    value={{ color: "currentColor", size: "25" }}
                >
                    <IconWrapper icon={icon} />
                    <article className="dark:text-primary2 text-secondary1 h-full flex justify-center ml-4 uppercase flex-col">
                        <SubHeading title={title} />
                    </article>
                </IconContext.Provider>
            </div>

            {data.map((item) => (
                <li key={item.company} className="list-none px-4">
                    <Time time={item.time} current={item.current} />
                    <Position position={item.position} />
                    <Company
                        company={item.company}
                        location={item.location}
                    />
                    <Description description={item.description} />
                </li>
            ))}
        </div>
    );
};
export default Experiences