import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="hidden w-full h-full lg:w-1/2  dark:bg-white/5 lg:grid">
          
                <img
                  // width={231}
                  // height={48}
                  src="/images/logo/homeivhero.webp"
                  alt="Logo"
                />
              
        </div>
       
      </div>
    </div>
  );
}
