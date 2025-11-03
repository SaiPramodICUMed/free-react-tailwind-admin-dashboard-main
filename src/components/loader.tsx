import React from "react";

interface LoaderProps {
  isLoad: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isLoad }) => {
  if (!isLoad) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-opacity-10 z-50">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
};

export default Loader;
