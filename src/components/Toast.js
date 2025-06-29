import React, { useEffect, useState } from "react";

const Toast = ({ message, type = "info", onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger slide-in after mount
    setShow(true);

    // Auto close after 2.5s
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300); // wait for animation to finish
    }, 2500);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  };

  return (
    <div
      className={`fixed top-5 right-5 transform transition-all duration-300 ease-in-out z-50
        ${show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${bgColor[type]} 
        px-4 py-2 text-white rounded shadow-lg`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">{message}</span>
        <button
          className="text-lg font-bold cursor-pointer"
          onClick={() => {
            setShow(false);
            setTimeout(onClose, 300); // manual close animation
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Toast;
