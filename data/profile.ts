const profileData={
    profilePicture : "/images/hitesh.png",
    subtitle : [
        "Student At NIT Kurukshetra",
        "Software Developer",
        "Competitive Programmer",
        "Full Stack Developer",
    ],
    name:"Hitesh Modi",
    links:{
        resume:"https://drive.google.com/file/d/1ICaJ8Y_MqiH1mFr226WENrmY-t-l0K-P/edit",
        github:"https://www.github.com/hiteshmodi0624",
        linkedIn:"https://www.linkedIn.com/in/hiteshmodi0624",
        twitter:"https://www.twitter.com/hiteshmodi_",
        instagram:"https://www.instagram.com/hiteshmodi__/",
        email:"mailto:mail@hiteshmodi.in",
    }
}
export default profileData

export interface links{
    resume:string,
    github:string,
    linkedIn:string,
    twitter:string,
    instagram:string,
    email:string
}