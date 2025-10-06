import React from "react";
import "./clock.css";
const Clockwise = () => {
  return (
    <div className="flex flex-col items-center">
      <h2 className=" text-center gigtitle text-neutral-300 animate-pulse">
        loading gigs
      </h2>
      <div className="loadergig"></div>
    </div>
  );
};

export default Clockwise;
