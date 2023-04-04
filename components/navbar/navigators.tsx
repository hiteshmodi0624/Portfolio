import { IoPersonOutline } from "react-icons/io5";
import Card from "../ui/card";
import LinkIconWrapper from "../ui/link-icon-wrapper";
import { RiFileList2Line } from "react-icons/ri";
import { BiGitRepoForked, BiPaperPlane } from "react-icons/bi";
const Navigators=()=>{
    return (
        <Card className="flex lg:flex-col h-min py-2 lg:py-6 items-center lg:space-y-2">
            <LinkIconWrapper
                title="About"
                icon={<IoPersonOutline />}
                link="#about"
            />
            <LinkIconWrapper
                title="Resume"
                icon={<RiFileList2Line />}
                link="#resume"
            />
            <LinkIconWrapper
                title="Projects"
                icon={<BiGitRepoForked />}
                link="#projects"
            />
            <LinkIconWrapper
                title="Contact"
                icon={<BiPaperPlane />}
                link="#contact"
            />
        </Card>
    );
}
export default Navigators