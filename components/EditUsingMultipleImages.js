"use client";
import React, { useEffect, useState } from "react";
import Notification from "./Notification";

export default function EditWithReference() {
    const [referenceImage, setReferenceImage] = useState(null);
    const [targetImage, setTargetImage] = useState(null);
    const [caption, setCaption] = useState("");
    const [editedImages, setEditedImages] = useState([]);
    const [enhancedPrompt, setEnhancedPrompt] = useState("");
    const [enhancementLoading, setEnhancementLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selectedEdited, setSelectedEdited] = useState([]);
    const [message, setMessage] = useState("");

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            if (type === "reference") {
                if (referenceImage && referenceImage.startsWith("blob:"))
                    URL.revokeObjectURL(referenceImage);
                setReferenceImage(objectUrl);
            } else {
                if (targetImage && targetImage.startsWith("blob:"))
                    URL.revokeObjectURL(targetImage);
                setTargetImage(objectUrl);
            }
            e.target.value = "";
        }
    };

    const stripHtml = (html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return (
            tempDiv.textContent.replace(/```html|```/g, "").trim() ||
            tempDiv.innerText.replace(/```html|```/g, "").trim() ||
            ""
        );
    };

    const handleRefRemoveImage = () => {
        if (referenceImage && referenceImage.startsWith("blob:")) {
            URL.revokeObjectURL(referenceImage);
        }
        setReferenceImage(null);
        setCaption("");
        setEditedImages([]);
    };

    const handleTargetRemoveImage = () => {
        if (targetImage && targetImage.startsWith("blob:")) {
            URL.revokeObjectURL(targetImage);
        }
        setTargetImage(null);
        setCaption("");
        setEditedImages([]);
    };

    const handleEnhancedPrompt = async () => {
        if (!caption.trim()) return;
        setEnhancementLoading(true);
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/enhancePrompt`,
            {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ userPrompt: caption }),
            }
        );
        const jsonData = await res.json();
        setEnhancedPrompt(jsonData.enhancedPrompt);
        setEnhancementLoading(false);
    };

    const handleStartEditing = async () => {
        if (!referenceImage || !targetImage || !caption.trim()) return;
        setIsEditing(true);

        try {
            const convertToBase64 = async (img) => {
                const blob = await fetch(img).then((res) => res.blob());
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () =>
                        resolve(reader.result.split(",")[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            };

            const referenceBase64 = await convertToBase64(referenceImage);
            const targetBase64 = await convertToBase64(targetImage);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/editMultiImage`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        referenceImg: referenceBase64,
                        targetImg: targetBase64,
                        prompt: caption,
                    }),
                }
            );

            const data = await res.json();
            setEditedImages(data.images || []);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to edit:", error);
            setIsEditing(false);
        }
    };

    const toggleSelectEdited = (img) => {
        setSelectedEdited((prev) =>
            prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]
        );
    };

    const handleSaveImages = async () => {
        if (selectedEdited.length === 0) return;
        setSaving(true);
        try {
            const res = await fetch("/api/save/images", {
                method: "POST",
                body: JSON.stringify({
                    selectedImages: selectedEdited,
                    prompt: caption,
                }),
            });
            const jsonData = await res.json();
            setMessage(jsonData);
        } catch (error) {
            setMessage({ error: "Failed to save images", status: 500 });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="flex flex-col w-full max-w-5xl bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
                    Edit Target Image using Reference
                </h1>

                {/* Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Reference Image */}
                    <label className="cursor-pointer bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center p-6 hover:border-purple-500 hover:bg-purple-100 transition">
                        <span className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full mb-4">
                            Reference Image
                        </span>
                        <span className="text-gray-500">Click to upload</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "reference")}
                        />
                    </label>

                    {/* Target Image */}
                    <label className="cursor-pointer bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center p-6 hover:border-blue-500 hover:bg-blue-100 transition">
                        <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full mb-4">
                            Target Image
                        </span>
                        <span className="text-gray-500">Click to upload</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "target")}
                        />
                    </label>
                </div>

                {/* Previews */}
                <div className="flex flex-col md:flex-row justify-center gap-6">
                    {referenceImage && (
                        <div className="relative inline-block">
                            <img
                                src={referenceImage}
                                alt="Reference"
                                className="max-h-56 rounded-lg border shadow"
                            />
                            <button
                                onClick={() => setZoomedImage(referenceImage)}
                                className="absolute top-2 left-2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100"
                            >
                                🔍
                            </button>
                            {/* Remove */}
                            <button
                                onClick={handleRefRemoveImage}
                                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
                                title="Remove image"
                            >
                                ✕
                            </button>

                        </div>

                    )}
                    {targetImage && (
                        <div className="relative inline-block">
                            <img
                                src={targetImage}
                                alt="Reference"
                                className="max-h-56 rounded-lg border shadow"
                            />
                            <button
                                onClick={() => setZoomedImage(targetImage)}
                                className="absolute top-2 left-2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100"
                            >
                                🔍
                            </button>
                            {/* Remove */}
                            <button
                                onClick={handleTargetRemoveImage}
                                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
                                title="Remove image"
                            >
                                ✕
                            </button>

                        </div>
                    )}
                </div>

                {/* Caption */}
                <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Describe how to edit the target image based on the reference."
                    className="mt-6 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                ></textarea>

                {/* Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    <button
                        onClick={handleStartEditing}
                        disabled={isEditing || !caption.trim()}
                        className={`px-6 py-2 rounded-md text-sm md:text-base lg:text-xl ${isEditing || !caption.trim() || enhancementLoading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            }`}
                    >
                        {isEditing ? "Editing..." : "Start Editing"}
                    </button>
                    {caption.trim() && (
                        <button
                            onClick={handleEnhancedPrompt}
                            disabled={isEditing || enhancementLoading}
                            className={`px-6 py-2 rounded-md text-sm md:text-base lg:text-xl ${isEditing || enhancementLoading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-purple-600 hover:bg-purple-700 text-white font-medium"
                                }`}
                        >
                            {enhancementLoading ? "Enhancing..." : "✨ Enhance Prompt"}
                        </button>
                    )}
                </div>

                {/* Enhanced Prompt Preview */}
                {enhancedPrompt && (
                    <div className="mt-6 p-5 bg-gray-50 border rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            ✨ Enhanced Prompt
                        </h3>
                        <div
                            className="prose prose-sm max-w-none text-gray-700 bg-white p-4 rounded-md overflow-auto max-h-56 scrollbar-hide"
                            dangerouslySetInnerHTML={{
                                __html: enhancedPrompt.replace(/```html|```/g, "").trim(),
                            }}
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => {
                                    setCaption(stripHtml(enhancedPrompt));
                                    setEnhancedPrompt("");
                                }}
                                className="px-5 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition"
                            >
                                ✅ Use this Prompt
                            </button>
                        </div>
                    </div>
                )}

                {/* Edited Results */}
                {editedImages.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-center text-cyan-700">
                            Edited Results
                        </h2>
                        {selectedEdited.length > 0 && (
                            <div className="flex justify-center my-3">
                                <button
                                    onClick={handleSaveImages}
                                    disabled={saving}
                                    className={`px-6 py-2 rounded-md text-sm md:text-base lg:text-xl text-white font-medium ${saving
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700"
                                        }`}
                                >
                                    {saving ? "Saving..." : "Save images to Gallery?"}
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {editedImages.map((img, index) => (
                                <div
                                    key={index}
                                    onClick={() => toggleSelectEdited(img)}
                                    className={`relative cursor-pointer rounded-lg shadow-md border overflow-hidden ${selectedEdited.includes(img) ? "ring-4 ring-blue-500" : ""
                                        }`}
                                >
                                    <img
                                        src={`data:image/png;base64,${img}`}
                                        alt={`Edited ${index}`}
                                        className="rounded-lg max-h-64 object-cover w-full h-full"
                                    />
                                    {/* Zoom */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setZoomedImage(`data:image/png;base64,${img}`);
                                        }}
                                        className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100"
                                    >
                                        🔍
                                    </button>
                                    {selectedEdited.includes(img) && (
                                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                            ✔ Selected
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Zoom Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                    onClick={() => setZoomedImage(null)}
                >
                    <div
                        className="relative max-w-5xl w-full flex justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setZoomedImage(null)}
                            className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl z-10"
                        >
                            &times;
                        </button>
                        <img
                            src={zoomedImage}
                            alt="Zoomed"
                            className="max-h-[90vh] w-auto rounded-lg shadow-lg object-contain"
                        />
                    </div>
                </div>
            )}

            <Notification
                isLogin={false}
                message={
                    message.status === 500 || message.status === 401
                        ? message.error
                        : message.message
                }
                statusCode={message.status}
                onClose={() => setMessage("")}
            />
        </div>
    );
}
