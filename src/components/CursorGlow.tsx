import { useEffect, useState } from 'react';

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: '600px',
          height: '600px',
          left: position.x - 300,
          top: position.y - 300,
          background:
            'radial-gradient(circle, rgba(29,78,216,0.06) 0%, rgba(29,78,216,0.02) 30%, transparent 70%)',
          transition: 'left 0.15s ease-out, top 0.15s ease-out',
          willChange: 'left, top',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '200px',
          height: '200px',
          left: position.x - 100,
          top: position.y - 100,
          background:
            'radial-gradient(circle, rgba(29,78,216,0.10) 0%, rgba(29,78,216,0.04) 50%, transparent 70%)',
          transition: 'left 0.08s ease-out, top 0.08s ease-out',
          willChange: 'left, top',
        }}
      />
    </div>
  );
}
