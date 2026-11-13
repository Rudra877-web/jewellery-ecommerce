'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { HeroSlideData } from '@/types/jewellery';

interface HeroSliderProps {
  slides: HeroSlideData[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const activeSlides = slides.length > 0 ? slides : [
    {
      id: 'default-1',
      title: 'The Royal Heritage Bridal Collection',
      subtitle: 'Handcrafted 22K Hallmarked Gold, Uncut Polki Diamonds & Zambian Emeralds.',
      ctaText: 'Explore Bridal Collection',
      ctaLink: '/category/necklaces',
      imageUrl: '/products/gold-temple-haaram.jpg',
      sortOrder: 1,
      isActive: true,
    },
  ];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, activeSlides.length, handleNext]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative w-full h-[460px] sm:h-[600px] lg:h-[680px] overflow-hidden bg-stone-950 select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero Highlights Slider"
    >
      {/* Slides Container */}
      {activeSlides.map((slide, idx) => {
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with Dark Vignette Gradient */}
            <div
              className={`absolute inset-0 bg-cover bg-center transform transition-transform duration-[6000ms] ${
                isCurrent ? 'scale-105' : 'scale-100'
              }`}
              style={{
                backgroundImage: `url('${slide.imageUrl}')`,
              }}
            />
            {/* Multi-layered luxury overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/70 sm:via-stone-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-transparent to-stone-950/40" />

            {/* Slide Content */}
            <div className="relative z-20 max-w-7xl mx-auto h-full px-5 sm:px-10 lg:px-16 flex flex-col justify-center">
              <div className="max-w-2xl space-y-3.5 sm:space-y-6">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E6CA65] text-[10.5px] sm:text-xs uppercase tracking-widest font-medium backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />
                  <span>Haute Joaillerie 2026</span>
                </div>

                <h1 className="font-serif text-2xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.2]">
                  {slide.title}
                </h1>

                {slide.subtitle && (
                  <p className="text-xs sm:text-base lg:text-lg text-stone-300 font-light max-w-xl leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {slide.subtitle}
                  </p>
                )}

                <div className="pt-2 sm:pt-4">
                  <Link
                    href={slide.ctaLink || '/category/all'}
                    className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs sm:text-sm uppercase tracking-widest font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-[#FAF8F5]/30 active:scale-95"
                  >
                    {slide.ctaText || 'Shop Collection'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows (Desktop & Tablet) */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-stone-900/60 hover:bg-[#D4AF37] text-white hover:text-stone-950 backdrop-blur-md border border-white/20 transition-all duration-200 opacity-80 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={handleNext}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-stone-900/60 hover:bg-[#D4AF37] text-white hover:text-stone-950 backdrop-blur-md border border-white/20 transition-all duration-200 opacity-80 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2.5">
          {activeSlides.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setCurrentIndex(dotIdx)}
              className={`transition-all duration-300 rounded-full ${
                dotIdx === currentIndex
                  ? 'w-8 h-2.5 bg-[#D4AF37]'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
