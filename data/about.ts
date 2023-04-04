function calculate_age(dob:Date) {
    var diff_ms = new Date().getFullYear() - dob.getFullYear();
    return diff_ms
}

const aboutData = {
    title: "Hello I'm Hitesh Modi.",
    article: [
        `A skilled full-stack developer with expertise in Next.js, Typescript, TailwindCss, React, and Node.js. 
        I love contributing to open-source projects and solving coding challenges. 
        Let's connect via social media or send me a message on this website to learn more!`,
    ],
    details: [
        { key:"Age", value:calculate_age(new Date(2001,6,24)) },
        { key:"Residence", value:"Guwahati, India"},
        { key:"Job", value:"Nathead (Freelance)"},
        { key:"Email" , value:"mail@hiteshmodi.in" },
        { key:"Open to Work", value:"Yes"},
    ],
    profiles:{
        leetcode:'https://leetcode.com/hiteshmodi0624/',
        gfg:'https://auth.geeksforgeeks.org/user/hiteshmodi0624',
    }
};
export default aboutData