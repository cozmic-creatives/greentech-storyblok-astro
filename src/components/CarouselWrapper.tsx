import React, { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from './ui/carousel';
import { cn } from '../lib/utils';
import ClientComponentRenderer from './ClientComponentRenderer';
import type { EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

interface CarouselWrapperProps {
  editableAttributes?: Record<string, any>;
  items: any[];
  slidesPerView?: string | number;
  carouselClasses?: string;
  itemContentMap: Record<string, string>;
  unprocessedItems: any[];
  autoPlay?: boolean;
  autoPlayDelay?: number;
}

export function CarouselWrapper({
  editableAttributes,
  items,
  slidesPerView = 1,
  carouselClasses,
  itemContentMap,
  unprocessedItems,
  autoPlay,
  autoPlayDelay,
}: CarouselWrapperProps) {
  const [loaded, setLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    setLoaded(true);
  }, [items, itemContentMap, unprocessedItems]);

  // Update active index when carousel slides change
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    // Set initial state
    onSelect();

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  if (!loaded) return null;

  // Parse responsive slidesPerView values (format: "desktop,tablet,mobile")
  let desktopSlides = 1;
  let tabletSlides = 1;
  let mobileSlides = 1;

  if (typeof slidesPerView === 'string' && slidesPerView.includes(',')) {
    const [desktop = '1', tablet = '1', mobile = '1'] = slidesPerView.split(',');
    desktopSlides = parseInt(desktop, 10) || 1;
    tabletSlides = parseInt(tablet, 10) || 1;
    mobileSlides = parseInt(mobile, 10) || 1;
  } else {
    // Single value for all breakpoints
    const numSlides =
      typeof slidesPerView === 'string' ? parseInt(slidesPerView, 10) || 1 : slidesPerView;
    desktopSlides = tabletSlides = mobileSlides = numSlides;
  }

  // Simplified basis class function using safelisted Tailwind classes
  const getBasisClass = (slides: number): string => {
    if (slides === 1) return 'basis-full';
    return `basis-1/${slides}`;
  };

  // Generate responsive classes
  const mobileBasis = getBasisClass(mobileSlides);
  const tabletBasis = getBasisClass(tabletSlides);
  const desktopBasis = getBasisClass(desktopSlides);

  // Carousel options for improved behavior
  const carouselOptions: EmblaOptionsType = {
    align: 'start',
    loop: true,
  };

  // Set up autoplay plugin
  const plugins = autoPlay
    ? [
        Autoplay({
          delay: autoPlayDelay,
          stopOnInteraction: true,
          stopOnMouseEnter: true,
        }),
      ]
    : [];

  // Calculate the number of dots based on visible slides
  const totalSlides = items.length;
  const visibleDots = Math.ceil(totalSlides / mobileSlides);

  return (
    <div {...editableAttributes}>
      <Carousel
        opts={carouselOptions}
        plugins={plugins}
        className={cn('w-full', carouselClasses)}
        setApi={setApi}
      >
        <CarouselContent className="py-5">
          {items.map(item => (
            <CarouselItem
              key={item._uid}
              className={cn(
                mobileBasis,
                { [`md:${tabletBasis}`]: tabletSlides !== mobileSlides },
                { [`lg:${desktopBasis}`]: desktopSlides !== tabletSlides }
              )}
            >
              <div className="px-2 h-full">
                {/* Render server-pre-rendered content */}
                {itemContentMap[item._uid] && (
                  <div
                    dangerouslySetInnerHTML={{ __html: itemContentMap[item._uid] }}
                    className="h-full"
                  />
                )}

                {/* Render any unprocessed client components */}
                {unprocessedItems
                  .find(unprocessed => unprocessed._uid === item._uid)
                  ?.components?.map((component: any) => (
                    <ClientComponentRenderer key={component._uid} component={component} />
                  ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {items.length > mobileSlides && (
          <>
            <CarouselPrevious className="hidden lg:flex" />
            <CarouselNext className="hidden lg:flex" />
          </>
        )}
      </Carousel>

      {/* Pagination dots */}
      {visibleDots > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {Array.from({ length: visibleDots }).map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                activeIndex === index ? 'bg-primary' : 'bg-gray-300'
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
