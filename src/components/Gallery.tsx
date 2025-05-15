import React, { useState } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { XIcon } from 'lucide-react';

interface GalleryProps {
  blok: {
    _uid: string;
    component: string;
    images: any[];
    [key: string]: any;
  };
}

const Gallery: React.FC<GalleryProps> = ({ blok }) => {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const openModal = (src: string) => {
    setActiveImage(src);
  };

  const closeModal = () => {
    setActiveImage(null);
  };

  return (
    <>
      <div
        className="gallery-component columns-2 md:columns-3 lg:columns-4 gap-4"
        data-blok-id={blok._uid}
      >
        {blok.images?.map((image, index) => (
          <div key={`gallery-item-${index}`} className="gallery-item mb-4 break-inside-avoid">
            <div className="cursor-pointer" onClick={() => openModal(image.filename)}>
              <img
                src={image.filename}
                alt={image.alt || ''}
                className="w-full hover:opacity-80 transition-opacity duration-300"
                loading="lazy"
                width={image.width || 300}
                height={image.height || 200}
              />
              {image.caption && <p className="gallery-caption">{image.caption}</p>}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!activeImage} onOpenChange={open => !open && closeModal()}>
        <DialogContent
          className="max-w-4xl p-0 border-none bg-transparent"
          onPointerDownOutside={closeModal}
        >
          <div className="relative w-full max-h-[90vh] ">
            <DialogClose className="absolute top-4 right-4 bg-white/80 rounded-full p-2 text-black z-10">
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            {activeImage && (
              <img
                src={activeImage}
                alt="Full size image"
                className="w-full h-auto object-contain rounded-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Gallery;
