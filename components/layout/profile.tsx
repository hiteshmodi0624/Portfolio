import Card from "../ui/card";
import Cover from "../profile/cover";
import ProfileData from "../profile/profile-data";
const Profile = () => {
    return (
        <Card
            className="before:absolute before:-left-3 before:-top-3 lg:before:w-full lg:before:h-full 
          before:bg-tertiary2 before:opacity-10 before:rounded-md before:-z-10 relative shadow-2xl"
        >
            <div className="overflow-hidden w-full h-[48rem] lg:h-full flex flex-col items-center">
                <Cover />
                <ProfileData />
            </div>
        </Card>
    );
};
export default Profile;
