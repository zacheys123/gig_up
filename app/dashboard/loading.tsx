import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="h-[92%] w-full flex justify-center items-center">
      <div className="flex flex-col items-center gap-2">
        {" "}
        <div className="gigtitle text-white flex flex-col gap-2 items-center">
          <div className="spinner">
            <div className="spinner1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
