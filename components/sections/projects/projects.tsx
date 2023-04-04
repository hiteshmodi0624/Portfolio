import Heading from "../../typography/heading"
import Content from "../../ui/content"
import projects, { works } from "@/data/projects"
import Project from "./project"
import Work from "./work"

const Projects=()=>{
    return (
        <section id="projects">
            <Heading title="My Projects" />
            <Content className="grid mx-auto space-y-2">
                {projects.map(project=><Project project={project} key={project.title}/>)}
            </Content>
            <Heading title="My Works" />
            <Content className="grid grid-cols-[repeat(auto-fit,12rem)] gap-2 justify-center">
                {works.map(work=><Work work={work} key={work.name}/>)}
            </Content>
        </section>
    );
}
export default Projects