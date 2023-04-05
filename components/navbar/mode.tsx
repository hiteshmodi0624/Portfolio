import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5"
import Card from "../ui/card"
import { useEffect, useState } from "react"

const Modes=()=>{
    const [dark,setDark]=useState(true);
    useEffect(()=>{
        if (
            localStorage.theme === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            document.documentElement.classList.add("dark");
            setDark(true)
        } else {
            document.documentElement.classList.remove("dark");
            setDark(false)
        }
    },[])
    const onToggleMode=()=>{
        if(dark){
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme","light")
        }
        else{
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme","dark")
        }
        setDark(prev=>!prev)
    }
    return (
        <Card className="flex flex-col w-min h-full px-6 py-4 lg:py-6 items-center justify-center lg:h-min lg:w-full">
            <button onClick={onToggleMode}>
                {dark?<IoSunnyOutline />:<IoMoonOutline/>}
            </button>
        </Card>
    );
}
export default Modes