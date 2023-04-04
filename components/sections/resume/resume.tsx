import aboutData from "@/data/about"
import Heading from "../../typography/heading"
import Content from "../../ui/content"
import Experiences from "./experience"
import Education from "./education"
import resumeData from "@/data/resume"
import { MdWork } from "react-icons/md";
import { FaGraduationCap } from "react-icons/fa";
const Resume=()=>{
    return (
        <section id="resume">
            <Heading title="Resume" />
            <Content className="grid xl:grid-cols-2 pt-0">
                <Experiences data={resumeData.experiences} icon={<MdWork/>} title="Experience"/>
                <Experiences data={resumeData.education} icon={<FaGraduationCap/>} title="Education"/>
            </Content>
        </section>
    );
}
export default Resume