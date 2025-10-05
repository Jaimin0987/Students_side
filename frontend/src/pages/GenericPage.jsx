import React from "react";

const GenericPage = ({ title }) => (
  <div className="text-center px-4">
    <h1 className="text-5xl font-extrabold text-[#EFF6E0] mb-4 tracking-tight">{title}</h1>
    <p className="text-xl text-[#AEC3B0] max-w-3xl mx-auto">
      This is a placeholder page for the {title} section. Functionality would be built out here.
    </p>
  </div>
);

export default GenericPage;
