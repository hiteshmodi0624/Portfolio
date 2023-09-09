const resumeData = {
    experiences: [
        {
            company: "MindGinie",
            position: "Full Stack Developer (Intern)",
            time: "June 2023 - August 2023",
            description: [`Research and propose new features to enhance the current product.`,`Explore and evaluate new APIs for integration.`,`Design architecture for implementing new features.`,
`Finalize and implement fixes prior to app deployment.`,`Primarily utilizing React Native for front-end development.`],
            current:false,
            location:"Remote"
        },
        {
            company: "Nathead",
            position: "Founder & Full Stack Developer",
            time: "July 2021 - June 2023",
            description: [`Developed and designed over 15 websites for clients using technologies such as HTML, CSS, Bootstrap, JavaScript, Node, Express, React, MongoDB and PHP.`,
            `Acted as a point of contact for clients and managed their specific requirements.`],
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
            description: [`Current CGPA:8.88`,'Member of Embedded-System and Robotics club.'],
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
