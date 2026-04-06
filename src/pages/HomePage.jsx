import { useRef } from 'react';

export default function HomePage() {
  const videoRef = useRef(null);

  const onVideoError = () => {
    const v = videoRef.current;
    if (!v) return;
    const backdrop = v.closest('.video-backdrop');
    if (backdrop) backdrop.classList.add('video-fallback');
  };

  return (
    <main className="main-content home-page">
      <div className="video-backdrop">
        <video
          ref={videoRef}
          className="bg-video"
          autoPlay
          muted
          loop
          playsInline
          id="bgVideo"
          onError={onVideoError}
        >
          <source src="/video/absvideo.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>
      <div className="home-content">
        <h1 className="home-title about-us-heading animate-in">ABOUT US</h1>
        <p className="home-desc animate-in delay-1">
          Brakes India Private Limited, founded in 1962 and part of the TVS Group, is India&apos;s largest manufacturer
          of automotive braking systems and a major global supplier. Headquartered in Chennai, it operates over 21
          manufacturing locations, offering braking solutions for passenger vehicles, commercial vehicles.
        </p>
      </div>
      <audio id="bgmusic" loop>
        <source src="/audiocoffee-afternoon-tea-128802.mp3" type="audio/mp4" />
      </audio>
    </main>
  );
}
