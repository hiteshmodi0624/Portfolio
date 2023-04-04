import SubHeading from "@/components/typography/sub-heading";
import IconWrapper from "@/components/ui/icon-wrapper"
import { IconContext } from "react-icons"
import { FaGraduationCap } from "react-icons/fa";
const Education=()=>{
    return (
        <div className="flex items-center faded-margin after:bottom-0 relative after:rotate-180 ml-6">
            <IconContext.Provider value={{ color: "currentColor", size: "25" }}>
                <IconWrapper icon={<FaGraduationCap />}/>
                <div className="text-primary2 h-full flex items-center ml-4 uppercase">
                    <SubHeading title="Education"/>
                </div>
            </IconContext.Provider>
        </div>
    );
}
export default Education