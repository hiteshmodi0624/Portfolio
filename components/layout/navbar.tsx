import { IconContext } from "react-icons";
import Navigators from "../navbar/navigators";
import Modes from "../navbar/mode";
const Navbar = () => {
    return (
        <div className="flex fixed top-0 w-screen lg:w-max z-[100] lg:relative lg:flex-col
         text-secondary1 dark:text-primary2 items-center gap-3 text-xs lg:my-6 p-4 lg:p-0 bg-secondary2 border-none outline-none h-min">
            <IconContext.Provider value={{ color: "currentColor", size: "25" }}>
                <Modes/>
                <Navigators/>
            </IconContext.Provider>
        </div>
    );
};
export default Navbar;
