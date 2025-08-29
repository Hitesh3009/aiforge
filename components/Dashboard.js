'use client';
import { useEffect, useState } from 'react';
import Notification from './Notification';
import Carousel3D from './Carousel3D';
import CarouselSkeleton from './CarouselSkeleton';


export default function Dashboard() {
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/getImages`);
        const data = await res.json();
        setImages(data.imageArr || []);
      } catch (err) {
        console.error('Failed to load images:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);


  const confirmDelete = async (image) => {
    if (!image) return;
    console.log(image);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/delete/image/${image.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const jsonData = await res.json();
        setMessage(jsonData);
        setImages(images.filter(img => img.id !== image.id));
      }
    } catch (error) {
      const jsonData = await res.json();
      setMessage(jsonData);
      console.error('Delete failed:', error);
    } finally {
      null;
    }
  };

  if (loading) {
    return <CarouselSkeleton />; // 🔥 show skeleton while fetching
  }

  if (!images.length) {
    return <p className="text-center mt-10 text-gray-500">No images found.</p>;
  }

  return (
    <div className="px-6 py-8 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-center">Gallery</h2>
      <Carousel3D items={images} handleDelete={confirmDelete}/>

      <Notification
        isLogin={false}
        message={message.status === 500 || message.status === 401 ? message.error : message.message}
        statusCode={message.status}
        onClose={() => setMessage('')}
      />
    </div>
  );
}
