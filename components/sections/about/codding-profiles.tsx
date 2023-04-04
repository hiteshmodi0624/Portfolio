import Button from "@/components/ui/button"
import aboutData from "@/data/about"
import { SiGeeksforgeeks, SiLeetcode } from "react-icons/si"

const CoddingProfiles=()=>{
    return (
        <div className="p-1 flex items-center flex-col xl:flex-row">
            <h3 className="uppercase bg-tertiary1 px-2 text-secondary1 font-bold inline py-1 min-w-max self-start">
                Coding Profiles:
            </h3>
            <div className="flex w-full flex-row">
                <Button
                    link={aboutData.profiles.leetcode}
                    title="Leetcode"
                    icon={<SiLeetcode />}
                />
                <Button
                    link={aboutData.profiles.gfg}
                    title="GeeksForGeeks"
                    icon={<SiGeeksforgeeks />}
                />
            </div>
        </div>
    );
}
export default CoddingProfiles