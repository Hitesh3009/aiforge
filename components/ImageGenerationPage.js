'use client';
import { useState } from 'react';

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const generateImagesApi = async (userPrompt) => {
    const data = await fetch(`http://localhost:3000/api/generate/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userPrompt }),
    });
    const result = await data.json();
    return result;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setImages([]);

    const resFromApi = await generateImagesApi(prompt);

    setTimeout(() => {
      setImages(resFromApi.images);
      setLoading(false);
    }, 2000);
  };

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
          className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
        <button
          onClick={() => alert("Save functionality not implemented")}
          disabled={loading}
          className={`${images.length > 0 ? 'inline-block' : 'hidden'} mt-4 ml-2 w-full md:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition`}
        >
          Save images to Gallery?
        </button>
      </div>

      {/* Image Gallery or Skeleton Loader */}
      {(loading || images.length > 0) && (
        <section className="max-w-6xl mx-auto px-2">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
            🖼️ Generated Images
          </h2>

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
                    onClick={() => setSelectedImage(src)}
                    className="cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden hover:scale-[1.02] transition-transform"
                  >
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

      {/* Modal for full image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-w-3xl w-full p-4 bg-white rounded-xl shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              &times;
            </button>
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="Enlarged"
              className="w-full h-[30rem] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
}
