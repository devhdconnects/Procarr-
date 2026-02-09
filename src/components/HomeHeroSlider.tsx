// HomeHeroSlider.tsx
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import { Autoplay, Pagination } from 'swiper/modules';


import intro1 from '../assets/intro/intro1.png';
import intro2 from '../assets/intro/intro2.png';
import intro3 from '../assets/intro/intro3.png';
import intro4 from '../assets/intro/11-1.webp';
import intro5 from '../assets/intro/11-2.webp';
import intro6 from '../assets/intro/11-3.webp';

const slides = [intro1, intro2, intro3, intro4, intro5, intro6];

export function HomeHeroSlider() {
  return (
    <section style={{ marginTop: '0.75rem', marginBottom: '1.5rem' }}>
      <div className="hero-slider-wrapper">
        {/* Overlay du logo dans le hero */}
        <div className="hero-logo-overlay">
          <span className="brand-pro">PRO</span>
          <span className="brand-carre">CARRÉ</span>
          <span className="brand-separator">|</span>
          <span className="brand-fils">&amp; Fils</span>
        </div>

        <Swiper
  modules={[Autoplay, Pagination]}
  loop
  autoplay={{
    delay: 5000,
    disableOnInteraction: false,
  }}
  pagination={{ clickable: true }}
  speed={700}
  style={{
    width: '100%',
    '--swiper-pagination-color': '#e63932',                 // bullet active rouge
    '--swiper-pagination-bullet-inactive-color': '#4b3a3f', // bullets inactifs gris/rouge sombre
    '--swiper-pagination-bullet-inactive-opacity': '1',
    '--swiper-pagination-bullet-size': '6px',
    '--swiper-pagination-bullet-horizontal-gap': '6px',
  } as React.CSSProperties}
>

          {slides.map((src, index) => (
            <SwiperSlide key={index} style={{ width: '100%' }}>
              <img src={src} alt="" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
