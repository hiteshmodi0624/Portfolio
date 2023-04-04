import About from "../sections/about/about";
import Contact from "../sections/contact/contact";
import Projects from "../sections/projects/projects";
import Resume from "../sections/resume/resume";
import TechStack from "../sections/resume/tech-stack";
import Card from "../ui/card";

const Sections = () => {
    return <Card className="my-6 -translate-x-2 -z-10 overflow-y-scroll">
        <About/>
        <Resume/>
        <TechStack/>
        <Projects/>
        <Contact/>
    </Card>;
};
export default Sections;
