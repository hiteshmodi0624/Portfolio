import IconWrapper from "@/components/ui/icon-wrapper"
import { FaChessKing, FaLaptopCode } from "react-icons/fa";

const Hobbies=()=>{
    return (
      <div className="p-1 items-center">
        <h3 className="uppercase bg-tertiary2 dark:bg-tertiary1 px-2 dark:text-secondary1 text-primary2 font-bold inline py-1 min-w-max">
          Loves to:
        </h3>
        <div className="grid text-center grid-cols-[repeat(auto-fit,8rem)] justify-center items-start">
          <IconWrapper icon={<FaLaptopCode />} title="Code" />
          <IconWrapper icon={<FaChessKing />} title="Play Chess" />
        </div>
      </div>
    );
}
export default Hobbies
