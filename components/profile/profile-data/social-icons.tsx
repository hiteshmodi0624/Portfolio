import { IconContext } from "react-icons"
import IconWrapper from "../../ui/link-icon-wrapper"
import { BsTwitter , BsLinkedin , BsGithub , BsInstagram , BsEnvelope } from "react-icons/bs"
import { FC } from "react";
import { links } from "@/data/profile";

const SocialIcons:FC<{links:links}>=({links})=>{
    return (
        <IconContext.Provider value={{ color: "currentColor", size: "15" }}>
            <div className="flex space-x-5 mt-4 text-primary2 justify-center">
                <IconWrapper noBottom={true} icon={<BsGithub/>}  link={links.github}/>
                <IconWrapper noBottom={true} icon={<BsTwitter />} link={links.twitter}/>
                <IconWrapper noBottom={true} icon={<BsLinkedin />} link={links.linkedIn}/>
                <IconWrapper noBottom={true} icon={<BsInstagram />} link={links.instagram}/>
                <IconWrapper noBottom={true} icon={<BsEnvelope />} link={links.email}/>
            </div>
        </IconContext.Provider>
    );
}
export default SocialIcons