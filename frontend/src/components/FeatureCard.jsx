import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, features, onGetStarted }) => (
  <div className="bg-[#124559] p-8 rounded-lg shadow-lg flex flex-col h-full transform transition-transform duration-300 hover:-translate-y-2">
    <Icon className="h-8 w-8 text-[#AEC3B0] mb-4" />
    <h3 className="text-2xl font-bold text-[#EFF6E0] mb-4">{title}</h3>
    <p className="text-[#AEC3B0] mb-6 flex-grow">{description}</p>
    <ul className="text-[#AEC3B0] space-y-2 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle2 className="w-4 h-4 mr-2 mt-1 text-[#598392] flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onGetStarted}
      className="group mt-auto text-left text-lg font-semibold text-[#EFF6E0] hover:text-white transition-colors duration-300"
    >
      <span className="flex items-center">
        Get Started
        <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </button>
  </div>
);

export default FeatureCard;
