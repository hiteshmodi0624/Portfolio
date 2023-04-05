import { FC } from "react";
import TypewriterComponent from "typewriter-effect"

const Subtitle:FC<{subtitle:string[]}>=({subtitle})=>{
    return (
        <div className="dark:text-tertiary1 text-tertiary2 w-full">
            <TypewriterComponent
                options={{
                    strings: subtitle,
                    autoStart: true,
                    loop: true,
                }}
            />
        </div>
    );
}
export default Subtitle