import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, GitGraph, ArrowRight, Code, Network, Database } from 'lucide-react';
import InteractiveHeroGraph from './InteractiveHeroGraph';

export default function HomeView({ currentTheme, onChangeTheme }) {
  const navigate = useNavigate();

  const isLight = currentTheme === 'light';
  const themeAccent = isLight ? '#D4FF00' : '#a3e635'; // Neon yellow-green for light
  const themeSecondary = isLight ? '#000000' : '#4d7c0f'; // Black vs Darker Green
  const themeBg = isLight ? '#ffffff' : '#000000';
  const themeText = isLight ? '#000000' : '#f4f4f5';
  
  const textSubtle = isLight ? 'text-black/70' : 'text-white/80';
  const glassBg = isLight ? 'bg-black/5' : 'bg-black/40';
  const borderSubtle = isLight ? 'border-black/20' : 'border-white/20';
  const btnInvertBg = isLight ? 'bg-black' : 'bg-white';
  const btnInvertText = isLight ? 'text-white' : 'text-black';

  return (
    <div 
      className="absolute inset-0 z-10 flex flex-col pointer-events-auto overflow-hidden"
      style={{ backgroundColor: themeBg, color: themeText }}
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
          colorAccent={isLight ? '#000000' : themeAccent}
          colorSecondary={isLight ? themeAccent : themeSecondary}
        />
      </div>

      {/* Foreground Content Wrapper (allows scrolling if needed, but passes clicks through where empty) */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none overflow-y-auto">
        
        {/* Hero Body - Left Aligned */}
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
                <span className="bg-[#D4FF00] text-black px-4 ml-2 pb-2 cursor-crosshair transition-all duration-300 hover:scale-105 inline-block" style={{ boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)' }}>
                  VIZ
                </span>
              ) : (
                <span className="text-[#a3e635] cursor-crosshair transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(163,230,53,0.9)] hover:scale-105 inline-block">
                  VIZ
                </span>
              )}
            </h1>
            
            {/* Subtitle */}
            <p className={`text-lg sm:text-xl ${textSubtle} font-medium mb-10 leading-relaxed max-w-xl p-5 border-l-4 ${isLight ? 'border-black' : 'border-[#a3e635]'} ${glassBg} backdrop-blur-md`}>
              Interactive tool for learning and understanding data structures through visual animations and AI-powered operations.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto font-sans mt-2">
              
              {/* Dashboard Button */}
              <button 
                onClick={() => navigate('/dashboard')}
                className={`group flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent border ${isLight ? 'border-black text-black hover:bg-black/5' : 'border-[#a3e635]/50 text-[#a3e635] hover:bg-[#a3e635]/10'} rounded-full font-medium text-sm transition-all w-full sm:w-auto`}
              >
                Dashboard
                <Database size={16} className={`${isLight ? 'text-black' : 'text-[#a3e635]/70 group-hover:text-[#a3e635]'} transition-colors`} />
              </button>

              {/* Outline Button (Sandbox) */}
              <button 
                onClick={() => navigate('/sandbox')}
                className={`group flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent border ${borderSubtle} ${isLight ? 'text-black hover:bg-black/5' : 'text-white hover:bg-white/5'} rounded-full font-medium text-sm transition-all w-full sm:w-auto`}
              >
                Code Sandbox
                <Code size={16} className={`${isLight ? 'text-black/70 group-hover:text-black' : 'text-white/70 group-hover:text-white'} transition-colors`} />
              </button>

              {/* Inverted Button (Visualizer) */}
              <div className="relative w-full sm:w-auto group">
                {!isLight && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#a3e635] via-[#4d7c0f] to-[#166534] rounded-full blur-md opacity-60 group-hover:opacity-100 transition duration-500 translate-y-2 scale-90"></div>
                )}
                
                <button 
                  onClick={() => navigate('/visualizer/bfs')}
                  className={`relative flex items-center justify-center gap-2 px-6 py-2.5 ${btnInvertBg} ${btnInvertText} rounded-full font-medium text-sm transition-transform hover:scale-[1.02] active:scale-95 w-full sm:w-auto`}
                  style={isLight ? { boxShadow: '4px 4px 0px 0px #D4FF00' } : {}}
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
