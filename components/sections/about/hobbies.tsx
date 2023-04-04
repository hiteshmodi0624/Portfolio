import IconWrapper from "@/components/ui/icon-wrapper"
import { BiCricketBall, BiMoviePlay, BiMusic } from "react-icons/bi"
import { FaChessKing, FaFootballBall, FaLaptopCode, FaAppStore} from "react-icons/fa"

const Hobbies=()=>{
    return (
        <div className="p-1 items-center">
            <h3 className="uppercase bg-tertiary1 px-2 text-secondary1 font-bold inline py-1 min-w-max">
                Loves to:
            </h3>
            <div className="grid text-center grid-cols-[repeat(auto-fit,8rem)] justify-center items-start">
                <IconWrapper icon={<FaLaptopCode />} title="Code" />
                <IconWrapper icon={< FaAppStore/>} title="Create websites and applications" />
                <IconWrapper icon={<FaChessKing />} title="Play Chess" />
                <IconWrapper icon={<FaFootballBall />} title="Play Football" />
                <IconWrapper icon={<BiCricketBall />} title="Watch Cricket" />
                <IconWrapper
                    icon={<BiMoviePlay />}
                    title="Watch Movies And TV Series"
                />
            </div>
        </div>
    );
}
export default Hobbies