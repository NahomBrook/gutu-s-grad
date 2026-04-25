import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { SLIDES } from '../data';

export default function Slideshow() {
  return (
    <section className="section" id="slideshow">
      <div className="container">
        <div className="s-head">
          <p className="s-eye">Best Moments</p>
          <h2 className="s-title">Highlights Reel</h2>
          <p className="s-sub">A visual journey through the most memorable moments</p>
        </div>

        <div className="slideshow-wrap">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop
            speed={700}
          >
            {SLIDES.map((slide, i) => (
              <SwiperSlide key={i}>
                <div className="slide-inner">
                  {/* Gradient fallback background */}
                  <div
                    className="slide-bg"
                    style={{ background: slide.gradient }}
                    aria-hidden
                  />
                  {/* Real photo — contain so the full image is always visible */}
                  {slide.realSrc && (
                    <img
                      src={slide.realSrc}
                      alt={slide.title}
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center center',
                      }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                  {!slide.realSrc && (
                    <span className="slide-emoji" role="img" aria-label={slide.title}>
                      {slide.emoji}
                    </span>
                  )}
                  <div className="slide-caption">
                    <h3>{slide.title}</h3>
                    <p>{slide.subtitle}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
