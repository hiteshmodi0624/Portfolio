const resumeData = {
    experiences: [
        {
            company: "Umego",
            position: "Full Stack Developer",
            time: "December 2023 - Present",
            description: [`Showcased versatility by quickly acquiring proficiency in emerging technologies such as NextJs, TypeScript, resulting in
a 25% increase in team efficiency.`,`Achieved a 15% improvement in user satisfaction scores by crafting visually appealing and user-friendly interfaces
using React.`,`Collaborated cross-functionally at Umego, contributing to reliable, scalable, and high-performance software. Utilized Jira,
reducing task resolution time by 40% for timely project deliveries.`],
            current:true,
            location:"Remote"
        },
        {
            company: "MindGinie",
            position: "Full Stack Developer (Intern)",
            time: "June 2023 - August 2023",
            description: [`Researched on 5+ fitness app APIs for seamless integration with the product.`,`Crafted 3 engaging games leveraging React Native and CSS design.`,`Engineered a data retrieval system, which reduced run time by 90%.`,
`Conducted comprehensive code reviews, leading to a 30% decrease in post-deployment issues and enhancing overall code quality.`],
            current:false,
            location:"Remote"
        },
        {
            company: "Nathead",
            position: "Founder & Full Stack Developer",
            time: "July 2021 - June 2023",
            description: [`Designed and maintained 15+ websites using HTML, CSS and JavaScript.`,
            `Mentored and guided 5 new team members in website development and technical discussions.`],
            current:false,
            location:"Remote"
        },
        {
            company: "Chegg India",
            position: "Math Expert (Freelancer)",
            time: "2021 - 2023",
            description: [`Assisted students clarify their math doubts by solving the sums in the topics that include Calculus, Geometry, and Algebra.`],
            current:false,
            location:"Remote"
        },
    ],
    education: [
        {
            company: "National Institute of Technology, Kurukshetra",
            position: "BTech",
            time: "2020 - 2024",
            description: [`Current CGPA:8.48`,'Member of Embedded-System and Robotics club.'],
            current:+(new Date().getFullYear())<=2024,
            location:"Kurukshetra"
        },
        {
            company: "Academind",
            position: "Full Stack Developement course",
            time: "2022-2023",
            description: [
                'React - The Complete Guide (incl Hooks, React Router, Redux)',
                'NodeJS - The Complete Guide (MVC, REST APIs, GraphQL, Deno)',
                'React Native - The Practical Guide [2023]',
                'Next.js & React - The Complete Guide (incl. Two Paths!)',
                'Understanding TypeScript'
            ],
            current:false,
            location:"Online"
        },
        {
            company: "Maria's Public School",
            position: "Higher Secondary Education",
            time: "2017-2019",
            description: [],
            current:false,
            location:"Guwahati"
        },
    ],
};
export default resumeData
