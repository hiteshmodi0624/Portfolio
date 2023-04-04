import { IoSunnyOutline } from "react-icons/io5"
import Card from "../ui/card"
import LinkIconWrapper from "../ui/link-icon-wrapper"

const Modes=()=>{
    return <Card className="flex flex-col w-min h-full px-6 py-2 lg:py-6 items-center justify-center lg:h-min lg:w-full">
        <LinkIconWrapper noBottom={true} icon={<IoSunnyOutline />} link="#" />
    </Card>
}
export default Modes