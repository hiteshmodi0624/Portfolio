import { FC } from "react"
import Button from "../../ui/button"
import {RiDownloadCloudFill } from "react-icons/ri"
import {FaPaperPlane } from "react-icons/fa"
const ProfileButtons:FC<{resume:string}>=({resume})=>{
    return <div className="grid grid-cols-2 w-full faded-margin after:rotate-180 font-extrabold text-sm">
        <Button title="Download CV" link={resume}  icon={<RiDownloadCloudFill/>}/>
        <Button title="Contact" link="#contact"  icon={<FaPaperPlane/>} target="_self"/>
    </div>
}
export default ProfileButtons