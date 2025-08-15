'use client';
import { useEffect, useState } from 'react';
import { FiTrash2, FiDownload, FiZoomIn } from 'react-icons/fi';
import Notification from './Notification';

export default function Dashboard() {
  const [images, setImages] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [maxImages, setMaxImages] = useState(7);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // for zoom view
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/getImages`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        setImages(data.imageArr || []);
      } catch (err) {
        console.error('Failed to load images:', err);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const updateMaxImages = () => {
      const width = window.innerWidth;
      setMaxImages(width < 768 ? 5 : 7);
    };

    updateMaxImages();
    window.addEventListener('resize', updateMaxImages);
    return () => window.removeEventListener('resize', updateMaxImages);
  }, []);

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/delete/image/${imageToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.ok) {
        const jsonData = await res.json();
        setMessage(jsonData);
        setImages(images.filter(img => img.id !== imageToDelete.id));
      }
    } catch (error) {
      const jsonData = await res.json();
      setMessage(jsonData);
      console.error('Delete failed:', error);
    } finally {
      setImageToDelete(null);
    }
  };

  const handleDownload = (img, index) => {
    const link = document.createElement('a');
    link.href = `data:${img.contentType};base64,${img.data}`;
    link.download = `image-${index}.${img.contentType.split('/')[1]}`;
    link.click();
  };

  const visibleImages = showAll ? images : images.slice(0, maxImages);

  if (!images.length) {
    return <p className="text-center mt-10 text-gray-500">No images found.</p>;
  }

  return (
    <div className="px-6 py-8 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-center">Gallery</h2>

      <div className="max-w-[80%] mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {visibleImages.map((img, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-lg shadow group">
              <img
                src={`data:${img.contentType};base64,${img.data}`}
                alt={`Gallery image ${index}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setSelectedImage(img)}
                  className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                  title="Zoom"
                >
                  <FiZoomIn className="text-green-600 w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDownload(img, index)}
                  className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                  title="Download"
                >
                  <FiDownload className="text-blue-600 w-5 h-5" />
                </button>
                <button
                  onClick={() => setImageToDelete(img)}
                  className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                  title="Delete"
                >
                  <FiTrash2 className="text-red-500 w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {images.length > maxImages && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 hover:underline font-medium"
            >
              {showAll ? 'See less' : 'See more'}
            </button>
          </div>
        )}
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
            <h3 className="text-lg font-semibold mb-4 text-black">Confirm Deletion</h3>
            <img
              src={`data:${imageToDelete.contentType};base64,${imageToDelete.data}`}
              alt="Preview"
              className="w-full h-48 object-cover rounded mb-4"
            />
            <p className="mb-6 text-gray-700">Are you sure you want to delete this image?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setImageToDelete(null)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-black"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Notification
        isLogin={false}
        message={message.status === 500 || message.status === 401 ? message.error : message.message}
        statusCode={message.status}
        onClose={() => setMessage('')}
      />
    </div>
  );
}
