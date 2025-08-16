'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { FiTrash2, FiDownload, FiZoomIn } from 'react-icons/fi';
import Notification from './Notification';
import { motion, AnimatePresence, useMotionValue, animate, easeOut } from "framer-motion";

function Draggable3DImageRing({ images, onZoom, onDownload, onDelete }) {
  const containerRef = useRef(null);
  const ringRef = useRef(null);

  const rotationY = useMotionValue(180);
  const startX = useRef(0);
  const currentRotationY = useRef(180);
  const isDragging = useRef(false);
  const velocity = useRef(0);

  const [currentScale, setCurrentScale] = useState(1);
  const [showImages, setShowImages] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // 🔥 track hover state

  const angle = useMemo(() => 360 / images.length, [images.length]);

  const getBgPos = (imageIndex, currentRot, scale) => {
    const scaledImageDistance = 500 * scale;
    const effectiveRotation = currentRot - 180 - imageIndex * angle;
    const parallaxOffset = ((effectiveRotation % 360 + 360) % 360) / 360;
    return `${-(parallaxOffset * (scaledImageDistance / 1.5))}px 0px`;
  };

  // Sync background parallax with rotation
  useEffect(() => {
    const unsubscribe = rotationY.on("change", (latestRotation) => {
      if (ringRef.current) {
        Array.from(ringRef.current.children).forEach((imgElement, i) => {
          imgElement.style.backgroundPosition = getBgPos(
            i,
            latestRotation,
            currentScale
          );
        });
      }
      currentRotationY.current = latestRotation;
    });
    return () => unsubscribe();
  }, [rotationY, images.length, currentScale, angle]);

  // Resize scaling
  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      setCurrentScale(viewportWidth <= 768 ? 0.8 : 1);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animate in
  useEffect(() => {
    setShowImages(true);
  }, []);

  // 🔥 Auto-rotate with pause on hover
  useEffect(() => {
    if (isHovered) return; // pause when hovered
    const interval = setInterval(() => {
      rotationY.set(currentRotationY.current + 1);
      currentRotationY.current = rotationY.get();
    }, 50);
    return () => clearInterval(interval);
  }, [isHovered]); // re-run when hover state changes

  const handleDragStart = (event) => {
    isDragging.current = true;
    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
    startX.current = clientX;
    rotationY.stop();
    velocity.current = 0;
    if (ringRef.current) {
      ringRef.current.style.cursor = "grabbing";
    }
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDrag);
    document.addEventListener("touchend", handleDragEnd);
  };

  const handleDrag = (event) => {
    if (!isDragging.current) return;
    const clientX =
      "touches" in event ? event.touches[0].clientX : event.clientX;
    const deltaX = clientX - startX.current;
    velocity.current = -deltaX * 0.5;
    rotationY.set(currentRotationY.current + velocity.current);
    startX.current = clientX;
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    if (ringRef.current) {
      ringRef.current.style.cursor = "grab";
      currentRotationY.current = rotationY.get();
    }
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchmove", handleDrag);
    document.removeEventListener("touchend", handleDragEnd);

    const initial = rotationY.get();
    const velocityBoost = velocity.current * 20;
    const target = initial + velocityBoost;

    animate(initial, target, {
      type: "inertia",
      velocity: velocityBoost,
      power: 0.8,
      timeConstant: 300,
      restDelta: 0.5,
      modifyTarget: (t) => Math.round(t / angle) * angle,
      onUpdate: (latest) => rotationY.set(latest),
    });

    velocity.current = 0;
  };

  const imageVariants = {
    hidden: { y: 200, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[500px] flex items-center justify-center relative select-none"
      style={{ transform: `scale(${currentScale})`, transformOrigin: "center center" }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}   // 🔥 stop rotation on hover
      onMouseLeave={() => setIsHovered(false)}  // 🔥 resume rotation
    >
      <div
        style={{
          perspective: "2000px",
          width: "300px",
          height: "400px",
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          ref={ringRef}
          className="w-full h-full absolute"
          style={{
            transformStyle: "preserve-3d",
            rotateY: rotationY,
            cursor: "grab",
          }}
        >
          <AnimatePresence>
            {showImages &&
              images.map((img, index) => (
                <motion.div
                  key={index}
                  className="w-full h-full absolute rounded-lg shadow-lg group overflow-hidden"
                  style={{
                    transformStyle: "preserve-3d",
                    backgroundImage: `url(data:${img.contentType};base64,${img.data})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backfaceVisibility: "hidden",
                    rotateY: index * -(360 / images.length),
                    z: -500 * currentScale,
                    transformOrigin: `50% 50% ${500 * currentScale}px`,
                    backgroundPosition: getBgPos(index, currentRotationY.current, currentScale),
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={imageVariants}
                  transition={{
                    delay: index * 0.1,
                    duration: 1.5,
                    ease: easeOut,
                  }}
                >
                  {/* Overlay Buttons */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition">
                    <button
                      onClick={() => onZoom(img)}
                      className="p-2 bg-white/20 hover:bg-white/40 rounded-full"
                    >
                      <FiZoomIn className="text-white text-xl" />
                    </button>
                    <button
                      onClick={() => onDownload(img, index)}
                      className="p-2 bg-white/20 hover:bg-white/40 rounded-full"
                    >
                      <FiDownload className="text-white text-xl" />
                    </button>
                    <button
                      onClick={() => onDelete(img)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-full"
                    >
                      <FiTrash2 className="text-white text-xl" />
                    </button>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}


export default function Dashboard() {
  const [images, setImages] = useState([]);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
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

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/delete/image/${imageToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const jsonData = await res.json();
        setMessage(jsonData);
        setImages(images.filter(img => img.id !== imageToDelete.id));
      }
    } catch (error) {
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

  if (!images.length) {
    return <p className="text-center mt-10 text-gray-500">No images found.</p>;
  }

  return (
    <div className="px-6 py-8 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-center">Gallery</h2>

      {/* 🔥 3D Image Ring with actions */}
      <Draggable3DImageRing
        images={images}
        onZoom={(img) => setSelectedImage(img)}
        onDownload={handleDownload}
        onDelete={(img) => setImageToDelete(img)}
      />

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
