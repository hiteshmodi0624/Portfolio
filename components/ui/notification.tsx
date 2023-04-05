import { FC } from "react";
import ReactDOM from "react-dom";

const Notification: FC<{ title: string; status: string }> = ({
    title,
    status,
}) => {
    let statusClasses = "";

    if (status === "success") {
        statusClasses = "bg-green-800";
    }

    if (status === "error") {
        statusClasses = "bg-red-800";
    }

    if (status === "pending") {
        statusClasses = "bg-blue-800";
    }

    return ReactDOM.createPortal(
        <div
            className={`fixed top-6 right-6 inline ${statusClasses} text-white py-2 px-2 flex justify-between items-center z-50 max-w-xs rounded-md`}
        >
            <h2>{title}</h2>
        </div>,
        document.getElementById("notification")!
    );
};
export default Notification;
