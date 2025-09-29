const projects:project[] = [
    {
        title: "Calorie Tracker - Smart Nutrition Management",
        description:"A comprehensive calorie tracking application with AI-powered food recognition, meal planning, and nutritional analysis. Features include barcode scanning, recipe suggestions, progress tracking, and integration with fitness wearables. Built with React Native for cross-platform compatibility and real-time data synchronization.",
        link: "https://github.com/hiteshmodi0624/CaloriesTracker",
        hashtags:['react-native', 'expo', 'ai', 'nutrition', 'llm', 'real-time-sync', 'cross-platform', 'prompt-engineering', 'ai']
    },
    {
        title: "PitchedInn - A Social Media Platform for Startup & Business Enthusiasts ",
        description:"Developing a social media platform for connecting entrepreneurs, investors, and collectors. Implemented features such as user authentication, user creation, posting, user follow, user edit, real-time messaging, and feed generation. Several features are currently running exclusively in development mode, and more features are being added.",
        link: "https://github.com/hiteshmodi0624/PitchedInn",
        hashtags:['next.js', 'react.js', 'vercel', 'tailwind-css', 'websockets', 'prisma', 'mongo-db', 'zod', 'trpc', 'type-script', 'next-auth']
    },
    {
        title: "Blog",
        description:"A Blogging Website developed using NextJs, TypeScript and TailwindCss. It includes features such as server side rendering, and reading data from a file.",
        link: "https://github.com/hiteshmodi0624/Blog",
        hashtags:['nextjs','reactjs','typescript','tailwindcss']
    },
    {
        title: "Shop",
        description:"An E-Commerce Website developed which includes features such as pagination, authentication, file-download, order-management and payemnt gateway integration",
        link: "https://github.com/hiteshmodi0624/Shop",
        hashtags:['node','express','mongoose','ejs']
    },
    {
        title: "Expense Tracker App",
        description:"An expense tracker app built for android and ios. It can be used to track recent as well as all time expenses. New Expense can be created and stored in a firebase server. Also the previously stored expenses can be edited or deleted.",
        link: "https://github.com/hiteshmodi0624/ExpenseTracker",
        hashtags:['react-native','firebase']
    },
    {
        title: "Favourites Places",
        description:"An favourites places app built for android and ios. It can be used to store the exact location of your favourite places along with a picture attached to the place.",
        link: "https://github.com/hiteshmodi0624/Favourite-Places",
        hashtags:['react-native','localstorage','authentication']
    },
    {
        title: "Food Ordering Front-End Portal",
        description:"A front-end website developed for ordering food and maintaining the cart.",
        link: "https://github.com/hiteshmodi0624/Food-Ordering-System",
        hashtags:['react','redux','front-end']
    }
];
export default projects


export const works:work[]=[
    {
        name: "Nathead",
        image: "/images/works/nathead.webp",
        link: "https://nathead.com/",
        background:"dark"

    },
    {
        name: "Aimers International",
        image: "/images/works/aimers.png",
        link: "https://aimersinternational.com/",
        background: "light"
    },
    {
        name: "Fidus Global",
        image: "/images/works/fidus.png",
        link: "https://fidusglobal.in/",
        background: "dark"
    },
    {
        name: "Adnil SchoolWorld Resource Centre",
        image: "/images/works/school-world.png",
        link: "https://www.schoolworldcentre.in/",
        background: "dark"
    },

]

export interface project{
    title:string,
    description:string,
    link:string,
    hashtags:string[]
}

export interface work{
    name:string,
    image:string,
    link:string,
    background:string
}
