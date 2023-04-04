import { IconContext } from "react-icons";
import Navigators from "../navbar/navigators";
import Modes from "../navbar/mode";
const Navbar = () => {
    return (
        <div className="flex lg:flex-col text-primary2 items-center gap-3 text-xs my-6">
            <IconContext.Provider value={{ color: "currentColor", size: "25" }}>
                <Modes/>
                <Navigators/>
            </IconContext.Provider>
        </div>
    );
};
export default Navbar;
