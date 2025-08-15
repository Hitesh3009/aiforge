"use client";
import React, { useEffect, useState } from "react";

export default function EditImage() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [images, setImages] = useState([]);
    const [caption, setCaption] = useState("");
    const [editedImages, setEditedImages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch(`${process.env.DOMAIN_NAME}/api/getImages`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = await res.json();
                setImages(data.imageArr || []);
            } catch (err) {
                console.error("Failed to load images:", err);
            }
        };
        fetchImages();
    }, []);

    const handleDeviceUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (selectedImage && selectedImage.startsWith("blob:")) {
                URL.revokeObjectURL(selectedImage);
            }
            const objectUrl = URL.createObjectURL(file);
            setSelectedImage(objectUrl);
            setCaption("");
            setEditedImages([]);
            e.target.value = "";
        }
    };

    const handleGallerySelect = (img) => {
        if (selectedImage && selectedImage.startsWith("blob:")) {
            URL.revokeObjectURL(selectedImage);
        }
        setSelectedImage(img);
        setCaption("");
        setEditedImages([]);
    };

    const handleRemoveImage = () => {
        if (selectedImage && selectedImage.startsWith("blob:")) {
            URL.revokeObjectURL(selectedImage);
        }
        setSelectedImage(null);
        setCaption("");
        setEditedImages([]);
    };

    const handleStartEditing = async () => {
        if (!selectedImage || !caption.trim()) return;
        setIsEditing(true);

        try {
            let base64Data = "";

            if (selectedImage.startsWith("blob:")) {
                // Convert Blob URL to Base64
                const blob = await fetch(selectedImage).then(res => res.blob());
                base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const result = reader.result;
                        resolve(result.split(",")[1]); // remove data:image/...;base64,
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } else if (selectedImage.startsWith("data:")) {
                // Already base64, just remove the prefix
                base64Data = selectedImage.split(",")[1];
            } else {
                console.error("Unsupported image format");
                setIsEditing(false);
                return;
            }

            const res = await fetch("${process.env.DOMAIN_NAME}/api/edit/image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    inpBase64Img: base64Data,
                    prompt: caption,
                })
            });

            const data = await res.json();
            console.log(data);
            
            setEditedImages(data.images || []);
            setIsEditing(false);

        } catch (error) {
            console.log("Failed to generate edit image:", error);
            setIsEditing(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl">
                {/* Main Upload Section */}
                <div className="flex-1 p-8 bg-white flex flex-col">
                    <h1 className="text-2xl font-semibold text-gray-700 mb-8 text-center">
                        Upload Image
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Upload from device */}
                        <label className="cursor-pointer bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center p-6 hover:border-blue-500 hover:bg-blue-100 transition">
                            <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full mb-4">
                                Choose File
                            </span>
                            <span className="text-gray-500">Click to select from device</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleDeviceUpload}
                            />
                        </label>

                        {/* Choose from gallery */}
                        <div
                            onClick={() => document.getElementById("galleryModal").showModal()}
                            className="cursor-pointer bg-green-50 border-2 border-dashed border-green-300 rounded-lg flex flex-col items-center justify-center p-6 hover:border-green-500 hover:bg-green-100 transition"
                        >
                            <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full mb-4">
                                Drop your image here
                            </span>
                            <span className="text-gray-500">Choose from App Gallery</span>
                        </div>
                    </div>

                    {/* Selected preview & textarea */}
                    {selectedImage && (
                        <div className="mt-6 text-center space-y-4 relative inline-block">
                            <div className="relative inline-block">
                                <img
                                    src={selectedImage}
                                    alt="Selected"
                                    className="max-h-64 rounded-lg shadow-lg mx-auto border"
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
                                    title="Remove image"
                                >
                                    ✕
                                </button>
                            </div>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Describe what needs to be edited in this image."
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            ></textarea>
                            <button
                                onClick={handleStartEditing}
                                disabled={isEditing || !caption.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow disabled:opacity-50"
                            >
                                {isEditing ? "Editing..." : "Start Editing"}
                            </button>
                        </div>
                    )}

                    {/* Edited Images */}
                    {editedImages.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4 text-center">
                                Edited Results
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {editedImages.map((img, index) => (
                                    <img
                                        key={index}
                                        src={`data:image/png;base64,${img.data}`}
                                        alt={`Edited ${index}`}
                                        className="rounded-lg shadow-md border max-h-64 object-cover mx-auto"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery Modal */}
            <dialog
                id="galleryModal"
                className="modal bg-transparent backdrop:bg-black/50"
            >
                <div className="bg-white rounded-3xl p-6 max-w-2xl mx-auto shadow-2xl">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
                        Select from Gallery
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-lg transition"
                                onClick={() => {
                                    handleGallerySelect(
                                        `data:${img.contentType};base64,${img.data}`
                                    );
                                    document.getElementById("galleryModal").close();
                                }}
                            >
                                <img
                                    src={`data:${img.contentType};base64,${img.data}`}
                                    alt={`Gallery image ${index}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-semibold">
                                    Select
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-right">
                        <button
                            onClick={() => document.getElementById("galleryModal").close()}
                            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg shadow-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
