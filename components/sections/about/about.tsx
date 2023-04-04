import aboutData from "@/data/about"
import Heading from "../../typography/heading"
import SubHeading from "../../typography/sub-heading"
import Content from "../../ui/content"
import Hobbies from "./hobbies"
import CoddingProfiles from "./codding-profiles"
import AboutItems from "./about-items"
const About=()=>{
    return (
        <section id="about">
            <Heading title="About Me" />
            <Content>
                <SubHeading title={aboutData.title} />
                <div className="flex flex-col space-y-2 mt-2">
                    {aboutData.article.map((article) => (
                        <p key={article}>{article}</p>
                    ))}
                </div>
                <div className="mt-6">
                    <ul className="grid xl:grid-cols-2">
                        {aboutData.details.map((detail) => (
                            <AboutItems detail={detail} key={detail.key}/>
                        ))}
                    </ul>
                </div>
                <CoddingProfiles/>
                <Hobbies/>
            </Content>
        </section>
    );
}
export default About