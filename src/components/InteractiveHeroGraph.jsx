import { useRef, useEffect } from 'react';

export default function InteractiveHeroGraph({ 
  density = 12000, 
  maxDistance = 150,
  currentTheme,
  colorAccent: overrideAccent,
  colorSecondary: overrideSecondary
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const colorsRef = useRef({ accent: '#8b5cf6', secondary: '#14b8a6' });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let particles = [];
    const numParticles = Math.floor((width * height) / density); 
    
    let mouse = { x: null, y: null, radius: 150 };
    let isClicking = false;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        baseRadius: Math.random() * 2 + 1.5,
        colorClass: Math.random() > 0.5 ? 'accent' : 'secondary'
      });
    }

    const resolveColor = (color, fallback) => {
      if (!color) return fallback;
      const match = color.match(/^var\((--[\w-]+)\)$/);
      if (match) {
        return getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim() || fallback;
      }
      return color;
    };

    const updateColors = () => {
      colorsRef.current = {
        accent: resolveColor(overrideAccent, '#8b5cf6'),
        secondary: resolveColor(overrideSecondary, '#14b8a6')
      };
    };

    updateColors();
    // Observe theme changes if it doesn't trigger a full re-render
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const { accent: colorAccent, secondary: colorSecondary } = colorsRef.current;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - p.x;
          let dy = mouse.y - p.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            if (isClicking) {
              const force = (mouse.radius - distance) / mouse.radius;
              const angle = Math.atan2(dy, dx);
              p.vx -= Math.cos(angle) * force * 2;
              p.vy -= Math.sin(angle) * force * 2;
            } else {
              const force = (mouse.radius - distance) / mouse.radius;
              const angle = Math.atan2(dy, dx);
              p.x -= Math.cos(angle) * force * 1.5;
              p.y -= Math.sin(angle) * force * 1.5;
            }
          }
        }
        
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2) {
          p.vx *= 0.95;
          p.vy *= 0.95;
        } else if (speed < 0.5) {
          p.vx += (Math.random() - 0.5) * 0.1;
          p.vy += (Math.random() - 0.5) * 0.1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.colorClass === 'accent' ? colorAccent : colorSecondary;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            let opacity = 1 - (distance / maxDistance);
            ctx.strokeStyle = colorAccent + Math.floor(opacity * 64).toString(16).padStart(2, '0'); 
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        
        if (mouse.x != null && mouse.y != null) {
          let dx = particles[i].x - mouse.x;
          let dy = particles[i].y - mouse.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            let opacity = 1 - (distance / maxDistance);
            ctx.strokeStyle = colorAccent + Math.floor(opacity * 150).toString(16).padStart(2, '0');
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      isClicking = false;
    };

    const handleMouseDown = () => {
      isClicking = true;
      mouse.radius = 300; 
    };

    const handleMouseUp = () => {
      isClicking = false;
      mouse.radius = 150;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleMouseLeave);
      canvas.removeEventListener('touchend', handleMouseLeave);
    };
  }, [density, maxDistance, currentTheme]);

  return (
    <div className="w-full h-full relative cursor-crosshair overflow-hidden group bg-transparent">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
