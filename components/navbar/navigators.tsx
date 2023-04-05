import { IoPersonOutline } from "react-icons/io5";
import Card from "../ui/card";
import LinkIconWrapper from "../ui/link-icon-wrapper";
import { RiFileList2Line } from "react-icons/ri";
import { BiGitRepoForked, BiPaperPlane } from "react-icons/bi";
const Navigators=()=>{
    return (
        <Card className="flex lg:flex-col h-min py-4 lg:py-6 items-center lg:space-y-2 mr-4 lg:mr-0">
            <LinkIconWrapper
                title="About"
                icon={<IoPersonOutline />}
                link="#about"
                target="_self"
            />
            <LinkIconWrapper
                title="Resume"
                icon={<RiFileList2Line />}
                link="#resume"
                target="_self"
            />
            <LinkIconWrapper
                title="Projects"
                icon={<BiGitRepoForked />}
                link="#projects"
                target="_self"
            />
            <LinkIconWrapper
                title="Contact"
                icon={<BiPaperPlane />}
                link="#contact"
                target="_self"
            />
        </Card>
    );
}
export default Navigators