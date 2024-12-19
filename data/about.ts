function calculate_age(dob:Date) {
    var diff_ms = new Date().getFullYear() - dob.getFullYear();
    return diff_ms
}

const aboutData = {
  title: "Hello I'm Hitesh Modi.",
  article: [
    `A Software Developer with experience in both front-end and back-end development. I thrive on problem-solving and developing innovative solutions using the latest technologies. I have a strong foundation in React, React Native, Node.js, and AWS technologies, with a special interest in AI integrations and map-based applications. Feel free to reach out to me so that we can work on a project together!`,
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
