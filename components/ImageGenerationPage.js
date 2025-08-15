'use client';

import { useEffect, useState } from 'react';
import Notification from './Notification';

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    localStorage.getItem('token');
  }, [])

  const generateImagesApi = async (userPrompt) => {
    const data = await fetch(`${process.env.DOMAIN_NAME}/api/generate/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ prompt: userPrompt }),
    });
    const result = await data.json();
    return result;
  };


  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImages([]);
    setSelectedImages([]);
    const resFromApi = await generateImagesApi(prompt);
    setTimeout(() => {
      setImages(resFromApi.images);
      setLoading(false);
    }, 2000);
  };

  const toggleImageSelect = (img) => {
    setSelectedImages((prev) =>
      prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]
    );
  };

  const handleSaveImages = async () => {
    const data = await fetch('/api/save/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ selectedImages, prompt }),
    });
    if (data.ok) {
      const jsonData = await data.json();
      const msg = jsonData;
      setMessage(msg);
    }
    else {
      const jsonData = await data.json();
      const errorMsg = jsonData;
      setMessage(errorMsg);
    }
  };

  const isSelected = (img) => selectedImages.includes(img);
  return (
    <main className="min-h-screen px-4 md:px-12 py-10 bg-gradient-to-br from-[#eef2f3] via-[#d6e4f0] to-[#f3e7e9]">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-10 drop-shadow">
        🎨 AI Image Generator
      </h1>

      <div className="max-w-3xl mx-auto bg-white bg-opacity-80 shadow-xl rounded-xl p-6 md:p-8 mb-10 backdrop-blur-sm space-x-5">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="w-full p-4 border border-gray-300 rounded-md resize-none h-36 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition text-sm md:text-base lg:text-xl"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>

      </div>

      {(loading || images.length > 0) && (
        <section className="max-w-6xl mx-auto px-2">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
            🖼️ Generated Images
          </h2>
          <div className='flex justify-center my-3 sticky top-4 z-20'>
            <button
              onClick={handleSaveImages}
              disabled={loading}
              className={`${selectedImages.length > 0 ? 'inline-block' : 'hidden'} cursor-pointer mt-4 ml-2  px-6 py-2 bg-green-600 hover:bg-green-700 text-sm md:text-base lg:text-xl text-white font-medium rounded-md transition`}
            >
              Save images to Gallery?
            </button>
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-gray-300 w-full"></div>
                </div>
              ))
              : images.map((src, index) => (
                <div
                  key={index}
                  onClick={() => toggleImageSelect(src)}
                  className={`relative cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02] ${isSelected(src) ? 'ring-4 ring-blue-500' : ''
                    }`}
                >
                  {/* Zoom/View Button (Same style as Dashboard) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(src);
                    }}
                    className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100"
                    title="Zoom In"
                  >
                    🔍
                  </button>

                  {/* Check Overlay */}
                  {isSelected(src) && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✔ Selected
                    </div>
                  )}

                  <div className="aspect-square w-full">
                    <img
                      src={`data:image/jpeg;base64,${src}`}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl z-10"
            >
              &times;
            </button>
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="Zoomed"
              className="max-h-[90vh] w-auto rounded-lg shadow-lg object-contain"
            />
          </div>
        </div>
      )}
      <Notification isLogin={false} message={message.status === 500 || message.status === 401 ? message.error : message.message} statusCode={message.status} onClose={() => setMessage('')} />
    </main>
  );
}
