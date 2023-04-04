import aboutData from "@/data/about"
import Heading from "../../typography/heading"
import Content from "../../ui/content"
import { IconContext } from "react-icons"
import IconWrapper from "../../ui/icon-wrapper"
import {
    SiTypescript,
    SiJavascript,
    SiMongodb,
    SiReact,
    SiNextdotjs,
    SiNodedotjs,
    SiExpress,
    SiTailwindcss,
    SiGit,
    SiGithub,
    SiCplusplus,
    SiGraphql
} from "react-icons/si";
import { TbBrandReactNative , TbApi} from "react-icons/tb";

const TechStack=()=>{
    return (
        <section id="tech-stack" className="w-full">
            <Heading title="My Tech Stack" />
            <Content className="grid grid-cols-[repeat(auto-fit,120px)] justify-center">
                <IconContext.Provider
                    value={{ color: "currentColor", size: "25" }}
                >
                    <IconWrapper title="Typescript" icon={<SiTypescript />} />
                    <IconWrapper title="Javascript" icon={<SiJavascript />} />
                    <IconWrapper title="React.js" icon={<SiReact />} />
                    <IconWrapper title="Next.js" icon={<SiNextdotjs />} />
                    <IconWrapper title="Node.js" icon={<SiNodedotjs />} />
                    <IconWrapper title="Express" icon={<SiExpress />} />
                    <IconWrapper title="Mongoose" icon={<SiMongodb />} />
                    <IconWrapper
                        title="Tailwind Css"
                        icon={<SiTailwindcss />}
                    />
                    <IconWrapper
                        title="React Native"
                        icon={<TbBrandReactNative />}
                    />
                    <IconWrapper title="REST Api" icon={<TbApi />} />
                    <IconWrapper title="Git" icon={<SiGit />} />
                    <IconWrapper title="Github" icon={<SiGithub />} />
                    <IconWrapper title="C++" icon={<SiCplusplus />} />
                    <IconWrapper title="GraphQl" icon={<SiGraphql />} />
                </IconContext.Provider>
            </Content>
        </section>
    );
}
export default TechStack