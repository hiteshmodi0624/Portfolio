import Image from "next/image";
import SocialIcons from "./profile-data/social-icons";
import Subtitle from "./profile-data/subtitle";
import profileData from "@/data/profile";
import ProfileButtons from "./profile-data/profile-buttons";

const ProfileData = () => {
    
    return (
        <div
            className="relative w-full text-center items-center flex flex-col h-1/2
                        before:w-screen before:h-16 before:absolute before:rotate-12 before:origin-top before:bg-secondary1
                        after:w-screen after:h-16 after:absolute after:-rotate-12 after:origin-top after:bg-secondary1"
            >
            <div className="z-50 mt-10">
                <h1 className="text-4xl text-primary2">{profileData.name}</h1>
                <Subtitle subtitle={profileData.subtitle} />
            </div>
            <div className="flex flex-col justify-between h-full w-full">
                <SocialIcons links={profileData.links} />
                <ProfileButtons resume={profileData.links.resume} />
            </div>
        </div>
    );
};
export default ProfileData;
