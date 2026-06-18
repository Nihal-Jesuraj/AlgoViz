import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, Database } from 'lucide-react';
import InteractiveHeroGraph from './InteractiveHeroGraph';

export default function HomeView({ currentTheme }) {
  const navigate = useNavigate();

  const isLight = currentTheme === 'light';

  return (
    <div 
      className="absolute inset-0 z-10 flex flex-col pointer-events-auto overflow-hidden"
      style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-text)' }}
    >
      
      {/* Noise Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Fullscreen Interactive Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto opacity-80">
        <InteractiveHeroGraph 
          currentTheme={currentTheme} 
          density={12000} 
          maxDistance={150} 
          colorAccent={isLight ? 'var(--color-text)' : 'var(--color-accent)'}
          colorSecondary={isLight ? 'var(--color-accent)' : 'var(--color-purple-light)'}
        />
      </div>

      {/* Foreground Content Wrapper */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none overflow-y-auto">
        
        {/* Hero Body */}
        <div className="flex-1 flex items-center justify-start px-8 max-w-[90rem] mx-auto w-full pb-32 pointer-events-none mt-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl w-full flex flex-col items-start text-left pointer-events-auto"
          >
            {/* Main Headline */}
            <h1 
              className="tracking-tight uppercase mb-6 leading-[0.85] drop-shadow-2xl" 
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(6rem, 14vw, 14rem)' }}
            >
              ALGO 
              {isLight ? (
                <span className="px-4 ml-2 pb-2 cursor-crosshair transition-all duration-300 hover:scale-105 inline-block"
                  style={{ background: 'var(--color-accent)', color: 'var(--color-text)', boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)' }}>
                  VIZ
                </span>
              ) : (
                <span className="cursor-crosshair transition-all duration-300 hover:scale-105 inline-block"
                  style={{ color: 'var(--color-accent)' }}>
                  VIZ
                </span>
              )}
            </h1>
            
            {/* Subtitle */}
            <p className={`text-lg sm:text-xl font-medium mb-10 leading-relaxed max-w-xl p-5 border-l-4 backdrop-blur-md`}
              style={{
                color: 'var(--color-text-muted)',
                borderColor: isLight ? 'var(--color-text)' : 'var(--color-accent)',
                background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.4)',
              }}>
              Interactive tool for learning and understanding data structures through visual animations and AI-powered operations.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto font-sans mt-2">
              
              {/* Dashboard Button */}
              <button 
                onClick={() => navigate('/dashboard')}
                className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent border rounded-full font-medium text-sm transition-all w-full sm:w-auto"
                style={{
                  borderColor: isLight ? 'var(--color-text)' : 'color-mix(in srgb, var(--color-accent) 50%, transparent)',
                  color: isLight ? 'var(--color-text)' : 'var(--color-accent)',
                }}
                onMouseEnter={(e) => { if (!isLight) e.currentTarget.style.background = 'color-mix(in srgb, var(--color-accent) 10%, transparent)'; }}
                onMouseLeave={(e) => { if (!isLight) e.currentTarget.style.background = 'transparent'; }}
              >
                Dashboard
                <Database size={16} className="transition-colors" style={{ color: isLight ? 'var(--color-text)' : 'var(--color-accent)' }} />
              </button>

              {/* Outline Button (Sandbox) */}
              <button 
                onClick={() => navigate('/sandbox')}
                className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent border border-[var(--glass-border)] rounded-full font-medium text-sm transition-all w-full sm:w-auto"
                style={{ color: isLight ? 'var(--color-text)' : 'var(--color-text)' }}
              >
                Code Sandbox
                <Code size={16} style={{ color: 'var(--color-text-muted)' }} />
              </button>

              {/* Inverted Button (Visualizer) */}
              <div className="relative w-full sm:w-auto group">
                {!isLight && (
                  <div className="absolute -inset-1 rounded-full blur-md opacity-60 group-hover:opacity-100 transition duration-500 translate-y-2 scale-90"
                    style={{ background: 'linear-gradient(to right, var(--color-accent), color-mix(in srgb, var(--color-accent) 50%, black), color-mix(in srgb, var(--color-accent) 20%, black))' }} />
                )}
                
                <button 
                  onClick={() => navigate('/visualizer/bfs')}
                  className="relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-transform hover:scale-[1.02] active:scale-95 w-full sm:w-auto"
                  style={{
                    background: isLight ? 'var(--color-text)' : 'var(--color-paper)',
                    color: isLight ? 'var(--color-paper)' : 'var(--color-text)',
                    boxShadow: isLight ? '4px 4px 0px 0px var(--color-accent)' : 'none',
                  }}
                >
                  Visualizer &rarr;
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
      
    </div>
  );
}
