// components/CarouselSkeleton.jsx
"use client";

import React from "react";

const CarouselSkeleton = () => {
  return (
    <section
      id="carousel-skeleton"
      className="bg-transparent min-w-full mx-auto flex items-center justify-center animate-pulse"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 min-w-[350px] md:min-w-[1000px] max-w-7xl">
        <div className="relative overflow-hidden h-[550px] flex items-center justify-center">
          {/* Skeleton Cards */}
          <div className="absolute w-full max-w-md h-[500px] bg-gray-200 rounded-xl shadow-sm" />
          <div className="absolute w-full max-w-md h-[500px] bg-gray-200 rounded-xl shadow-sm translate-x-[40%] scale-95 opacity-60" />
          <div className="absolute w-full max-w-md h-[500px] bg-gray-200 rounded-xl shadow-sm -translate-x-[40%] scale-95 opacity-60" />

          {/* Arrows */}
          <div className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full" />
          <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full" />

          {/* Dots */}
          <div className="absolute bottom-6 flex space-x-3">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="w-3 h-3 rounded-full bg-gray-300"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarouselSkeleton;
