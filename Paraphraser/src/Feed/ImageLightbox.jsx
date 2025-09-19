import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

const ImageLightbox = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-full w-full md:max-w-3xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl z-50 hover:text-gray-300"
        >
          <FiX />
        </button>

        {/* Main Image */}
        <img
          src={images[currentIndex]}
          alt={`Post Image ${currentIndex + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-lg mx-auto shadow-lg"
        />

        {/* Prev & Next Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-2 rounded-full"
            >
              <FiChevronLeft size={28} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-2 rounded-full"
            >
              <FiChevronRight size={28} />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === currentIndex ? "bg-white" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
