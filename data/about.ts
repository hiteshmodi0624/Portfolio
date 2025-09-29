function calculate_age(dob:Date) {
    var diff_ms = new Date().getFullYear() - dob.getFullYear();
    return diff_ms
}

const aboutData = {
  title: "Hello I'm Hitesh Modi.",
  article: [
    `A passionate Software Engineer with 1.5 years of hands-on product engineering experience and a B.Tech from NIT Kurukshetra. I specialize in full-stack development, mobile applications, and AI-powered solutions.`,
    `I've led full mobile migrations, built custom Mapbox integrations, prototyped agentic AI systems, and orchestrated end-to-end production systems on AWS. I thrive on owning end-to-end solutions from API design to app UX and production deployments.`,
    `My expertise spans across mobility, geospatial applications, SaaS platforms, and AI tooling. I'm passionate about building clean, scalable architectures and delivering measurable impact through innovative technology solutions.`
  ],
  details: [
    { key: "Age", value: calculate_age(new Date(2001, 6, 24)) },
    { key: "Resides in", value: "Guwahati, India" },
    { key: "Email", value: "mail@hiteshmodi.in" },
  ],
  profiles: {
    leetcode: "https://leetcode.com/hiteshmodi0624/",
    gfg: "https://auth.geeksforgeeks.org/user/hiteshmodi0624",
  },
};
export default aboutData
