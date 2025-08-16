// components/Carousel3D.jsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FiTrash2, FiDownload } from "react-icons/fi";

const Carousel3D = ({
    items,
    handleDelete,
    autoRotate = true,
    rotateInterval = 4000,
    cardHeight = 500,
}) => {
    const [active, setActive] = useState(0);
    const carouselRef = useRef(null);
    const [isInView, setIsInView] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // for zoom
    const [imageToDelete, setImageToDelete] = useState(null); // for delete modal
    const minSwipeDistance = 50;

    useEffect(() => {
        if (autoRotate && isInView && !isHovering) {
            const interval = setInterval(() => {
                setActive((prev) => (prev + 1) % items.length);
            }, rotateInterval);
            return () => clearInterval(interval);
        }
    }, [isInView, isHovering, autoRotate, rotateInterval, items.length]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.2 }
        );
        if (carouselRef.current) {
            observer.observe(carouselRef.current);
        }
        return () => observer.disconnect();
    }, []);

    const onTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
        setTouchEnd(null);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) {
            setActive((prev) => (prev + 1) % items.length);
        } else if (distance < -minSwipeDistance) {
            setActive((prev) => (prev - 1 + items.length) % items.length);
        }
    };

    const handleDownload = (img, index) => {
        const link = document.createElement("a");
        link.href = `data:${img.contentType};base64,${img.data}`;
        link.download = `image-${index}.${img.contentType.split("/")[1]}`;
        link.click();
    };

    const getCardAnimationClass = (index) => {
        if (index === active) return "scale-100 opacity-100 z-20";
        if (index === (active + 1) % items.length)
            return "translate-x-[40%] scale-95 opacity-60 z-10";
        if (index === (active - 1 + items.length) % items.length)
            return "translate-x-[-40%] scale-95 opacity-60 z-10";
        return "scale-90 opacity-0";
    };

    return (
        <section
            id="carousel3d"
            className="bg-transparent min-w-full mx-auto flex items-center justify-center"
        >
            <div className="w-full px-4 sm:px-6 lg:px-8 min-w-[350px] md:min-w-[1000px] max-w-7xl">
                <div
                    className="relative overflow-hidden h-[550px]"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    ref={carouselRef}
                >
                    {/* Cards container */}
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className={`absolute top-0 w-full max-w-md transform transition-all duration-500 ${getCardAnimationClass(
                                    index
                                )}`}
                            >
                                {/* Card */}
                                <div
                                    className={`overflow-hidden bg-white h-[${cardHeight}px] border shadow-sm hover:shadow-md flex flex-col rounded-xl`}
                                >
                                    {/* Image */}
                                    <div
                                        className="relative cursor-pointer group"
                                        onClick={() => setSelectedImage(item)}
                                    >
                                        <img
                                            src={`data:${item.contentType};base64,${item.data}`}
                                            alt={`Gallery image ${index}`}
                                            className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {/* Floating Action Buttons */}

                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className=" flex gap-3 justify-evenly">
                                            <button
                                                onClick={() => handleDownload(item, index)}
                                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                                                title="Download"
                                            >
                                                <FiDownload className="text-blue-600 w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setImageToDelete(item)}
                                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                                                title="Delete"
                                            >
                                                <FiTrash2 className="text-red-500 w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* End Card */}
                            </div>
                        ))}
                    </div>

                    {/* Arrows */}
                    <button
                        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full items-center justify-center text-gray-500 hover:bg-white z-30 shadow-md transition-all hover:scale-110"
                        onClick={() =>
                            setActive((prev) => (prev - 1 + items.length) % items.length)
                        }
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full items-center justify-center text-gray-500 hover:bg-white z-30 shadow-md transition-all hover:scale-110"
                        onClick={() => setActive((prev) => (prev + 1) % items.length)}
                        aria-label="Next"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-3 z-30">
                        {items.map((_, idx) => (
                            <button
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${active === idx
                                    ? "bg-gray-500 w-5"
                                    : "bg-gray-200 hover:bg-gray-300"
                                    }`}
                                onClick={() => setActive(idx)}
                                aria-label={`Go to item ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Zoom Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="relative max-w-4xl w-full mx-4">
                        <img
                            src={`data:${selectedImage.contentType};base64,${selectedImage.data}`}
                            alt="Zoomed view"
                            className="w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 px-3 py-1 rounded-md bg-white text-black hover:bg-gray-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {imageToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-black">
                            Confirm Deletion
                        </h3>
                        <img
                            src={`data:${imageToDelete.contentType};base64,${imageToDelete.data}`}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded mb-4"
                        />
                        <p className="mb-6 text-gray-700">
                            Are you sure you want to delete this image?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setImageToDelete(null)}
                                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-black"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleDelete(imageToDelete);
                                    setImageToDelete(null);
                                }}
                                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Carousel3D;
