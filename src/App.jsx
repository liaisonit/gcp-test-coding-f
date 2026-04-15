import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight,
  Menu,
  X,
  Play,
  ArrowUpRight,
  Settings,
  Calculator,
  MessageSquare,
  ChevronUp
} from 'lucide-react';

/**
 * CUSTOM HOOK: WHISPER SCROLL REVEAL
 */
const useScrollReveal = (threshold = 0.1) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

/**
 * ULTRA-MINIMAL THEMEABLE CURSOR
 */
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(!!e.target.closest('#global-map'));
    };
    
    const handleMouseOver = (e) => {
      const isInteractive = e.target.closest('button') || e.target.closest('a') || e.target.closest('.interactive') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('.toolkit-interactive');
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <div
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[10000] hidden md:block transition-opacity duration-300 cursor-dot"
        style={{ 
          transform: `translate(${position.x - 3}px, ${position.y - 3}px)`,
          opacity: isHidden ? 0 : (isHovering ? 0 : 1)
        }}
      />
      <div
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] transition-all duration-500 ease-out hidden md:block border cursor-ring ${
          isHovering ? 'w-16 h-16' : 'w-8 h-8 opacity-0'
        }`}
        style={{ 
          transform: `translate(${position.x - (isHovering ? 32 : 16)}px, ${position.y - (isHovering ? 32 : 16)}px)`,
          opacity: isHidden ? 0 : undefined
        }}
      />
    </>
  );
};

/* ==========================================================================
   INTERACTIVE TOOLKIT
   ========================================================================== */

const FloatingToolkit = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [attendees, setAttendees] = useState(100);
  const [eventType, setEventType] = useState('mice');

  const calculateEstimate = () => {
    const baseRates = { mice: 150, tech: 300, awards: 250 };
    const min = attendees * baseRates[eventType] * 0.8;
    const max = attendees * baseRates[eventType] * 1.5;
    return `₹${(min * 80).toLocaleString()} - ₹${(max * 80).toLocaleString()}`;
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-12 md:right-12 z-[8000] flex flex-col items-end pointer-events-none">
      
      {/* Toolkit Panel */}
      <div className={`pointer-events-auto mb-4 w-[calc(100vw-3rem)] md:w-80 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 hidden'}`}>
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h4 className="font-wide text-sm font-extralight uppercase tracking-[0.1em] text-white flex items-center gap-2">
            <Settings size={14} /> Client Tools
          </h4>
          <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors toolkit-interactive">
            <X size={16} />
          </button>
        </div>

        {/* Tool 1: Budget Estimator */}
        <div className="mb-6">
          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/50 mb-3 flex items-center gap-2">
            <Calculator size={12} /> Budget Estimator
          </p>
          <div className="space-y-4">
            <div>
              <label className="font-sans text-[10px] text-white/70 block mb-1">Event Type</label>
              <select 
                value={eventType} 
                onChange={(e) => setEventType(e.target.value)}
                className="toolkit-interactive w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-white/30 transition-colors"
              >
                <option value="mice" className="bg-black">Corporate & MICE</option>
                <option value="tech" className="bg-black">Experiential Tech / Launch</option>
                <option value="awards" className="bg-black">Award Function / Gala</option>
              </select>
            </div>
            <div>
              <label className="font-sans text-[10px] text-white/70 flex justify-between mb-1">
                <span>Scale (Attendees)</span>
                <span>{attendees}</span>
              </label>
              <input 
                type="range" 
                min="50" max="5000" step="50"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                className="toolkit-interactive w-full accent-white"
              />
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
              <span className="block font-sans text-[8px] tracking-[0.2em] uppercase text-white/40 mb-1">Estimated Range</span>
              <span className="font-wide text-lg text-white font-light tracking-wide">{calculateEstimate()}</span>
            </div>
          </div>
        </div>

        {/* Utility Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="toolkit-interactive flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-[10px] font-sans tracking-[0.1em] uppercase text-white transition-colors">
            <ChevronUp size={14} /> Top
          </button>
          <a href="mailto:info@eventsandpro.com" className="toolkit-interactive flex items-center justify-center gap-2 bg-white text-black hover:bg-white/80 rounded-xl py-3 text-[10px] font-sans tracking-[0.1em] uppercase transition-colors font-medium">
            <MessageSquare size={14} /> Contact
          </a>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto toolkit-interactive w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-white hover:text-black hover:scale-105 transition-all duration-500 group"
      >
        {isOpen ? <X size={24} className="transition-transform duration-500 rotate-90" /> : <Settings size={24} className="group-hover:rotate-180 transition-transform duration-700" />}
      </button>
    </div>
  );
};


/* ==========================================================================
   SHARED GLOBAL COMPONENTS
   ========================================================================== */

const Preloader = ({ finishLoading }) => {
  const [quote, setQuote] = useState("");
  const [isFading, setIsFading] = useState(false);
  const [startProgress, setStartProgress] = useState(false);

  const quotes = [
    "Events & Pro: Engineering corporate experiences.",
    "Mastering the game of strategy and experience.",
    "Transforming visions into unforgettable corporate events.",
    "The magic resides in the unseen logistics.",
    "Excellence in every moment."
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    const progressTimer = setTimeout(() => setStartProgress(true), 100);
    const fadeTimer = setTimeout(() => setIsFading(true), 2500);
    const removeTimer = setTimeout(() => finishLoading(), 3500);
    
    return () => { 
      clearTimeout(progressTimer);
      clearTimeout(fadeTimer); 
      clearTimeout(removeTimer); 
    };
  }, [finishLoading]);

  return (
    <div className={`fixed inset-0 z-[9000] bg-[#050505] flex flex-col items-center justify-center px-12 transition-opacity duration-1000 ease-in-out ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="overflow-hidden mb-8">
        <h2 className="text-white/80 font-wide font-extralight tracking-[0.2em] uppercase text-xs md:text-sm text-center max-w-2xl leading-relaxed animate-fade-in-up">
          {quote}
        </h2>
      </div>
      <div className="w-48 md:w-64 h-[1px] bg-white/10 relative overflow-hidden opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="absolute top-0 left-0 h-full bg-white transition-all ease-linear" style={{ width: startProgress ? '100%' : '0%', transitionDuration: '2400ms' }} />
      </div>
    </div>
  );
};

const Footer = ({ setCurrentPage }) => {
  const [ref, isVisible] = useScrollReveal();

  return (
    <footer className="bg-[#050505] pt-32 2xl:pt-48 pb-12 px-6 md:px-12 2xl:px-24 border-t border-white/5">
      <div ref={ref} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-32 2xl:mb-48">
          <div>
            <img 
              src="https://static.wixstatic.com/media/745981_5cb5b3705132499081e24b12f5f4b3d4~mv2.png" 
              alt="Events & Pro Logo" 
              className="h-[60px] md:h-[75px] 2xl:h-[90px] object-contain invert brightness-0 mb-12 opacity-90 cursor-pointer interactive" 
              onClick={() => setCurrentPage('home')}
            />
            <p className="text-[9px] 2xl:text-[10px] font-sans tracking-[0.5em] uppercase text-white/40 mb-8 border-b border-white/10 inline-block pb-3">Initialize Sequence</p>
            <h2 className="text-5xl md:text-6xl 2xl:text-8xl font-wide font-extralight uppercase tracking-[0.05em] text-white mb-10 leading-none">
              Let's craft <br/> the <span className="text-transparent custom-stroke-text font-normal">exceptional.</span>
            </h2>
            <a href="mailto:info@eventsandpro.com" className="interactive flex items-center w-fit text-xs 2xl:text-sm font-sans tracking-[0.2em] uppercase text-white hover:text-white/50 transition-colors border-b border-white/20 hover:border-white/5 pb-2 group mb-4">
              INFO@EVENTSANDPRO.COM
              <ArrowUpRight className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" strokeWidth={1.5} />
            </a>
            <a href="tel:+917709356661" className="interactive flex items-center w-fit text-xs 2xl:text-sm font-sans tracking-[0.2em] uppercase text-white hover:text-white/50 transition-colors border-b border-white/20 hover:border-white/5 pb-2 group">
              +91 77093 56661
              <ArrowUpRight className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" strokeWidth={1.5} />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-12 md:justify-end">
            <div className="flex flex-col space-y-5 text-[9px] 2xl:text-[11px] font-sans tracking-[0.3em] uppercase text-white/50">
              <span className="text-white font-semibold mb-2 border-b border-white/10 pb-3 w-fit">Network</span>
              <span>Pune (HQ)</span>
              <span>Mumbai</span>
              <span>Delhi-NCR</span>
              <span>Bangalore</span>
            </div>
            <div className="flex flex-col space-y-5 text-[9px] 2xl:text-[11px] font-sans tracking-[0.3em] uppercase text-white/50">
              <span className="text-white font-semibold mb-2 border-b border-white/10 pb-3 w-fit">Navigation</span>
              <button onClick={() => setCurrentPage('home')} className="interactive text-left hover:text-white transition-colors w-fit">Home</button>
              <button onClick={() => setCurrentPage('about')} className="interactive text-left hover:text-white transition-colors w-fit">About Us</button>
              <button onClick={() => setCurrentPage('expertise')} className="interactive text-left hover:text-white transition-colors w-fit">Solutions</button>
              <button onClick={() => setCurrentPage('gallery')} className="interactive text-left hover:text-white transition-colors w-fit">Work Gallery</button>
              <button onClick={() => setCurrentPage('contact')} className="interactive text-left hover:text-white transition-colors w-fit">Contact</button>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center text-[8px] 2xl:text-[10px] font-sans text-white/40 tracking-[0.4em] uppercase gap-4">
          <span>© {new Date().getFullYear()} Events & Pro.</span>
          <span>All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
};

const GlobalMap = () => {
  const mapRef = useRef(null);
  const [activeLocation, setActiveLocation] = useState(null);

  useEffect(() => {
    const initMap = () => {
      if (!window.L || mapRef.current) return;
      
      const map = window.L.map('global-map', {
        center: [20, 78], // Focused more on India / APAC
        zoom: 3.5, 
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true
      });
      mapRef.current = map;

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      const customIcon = window.L.divIcon({
        className: 'custom-pin',
        html: '<div style="background-color: white; width: 6px; height: 6px; border-radius: 50%; box-shadow: 0 0 15px 3px rgba(255,255,255,0.7); cursor: pointer;"></div>',
        iconSize: [6, 6],
        iconAnchor: [3, 3]
      });

      const locations = [
        // India Focus
        { name: "Pune (HQ)", coords: [18.5204, 73.8567], subtitle: "Fintech Leadership Summit", year: "2023", attendees: "1,200 Delegates", setup: "Kinetic LED ceiling with 360° surround staging", description: "A hyper-secure, data-driven environment engineered for top-tier global banking executives." },
        { name: "Mumbai", coords: [19.0760, 72.8777], subtitle: "Annual Awards Gala", year: "2024", attendees: "2,500+ VIPs", setup: "Massive LED arrays & synchronized drone swarms", description: "Orchestrated massive stadium-scale infrastructure for India's most high-profile corporate awards." },
        { name: "Delhi-NCR", coords: [28.7041, 77.1025], subtitle: "Global Auto Expo Reveal", year: "2025", attendees: "8,000+ Visitors", setup: "Holographic car reveals & tiered amphitheater", description: "Executed an immersive, high-decibel launch environment for a flagship electric vehicle reveal." },
        { name: "Bangalore", coords: [12.9716, 77.5946], subtitle: "DevCon Global", year: "2023", attendees: "12,000 Tech Leaders", setup: "Multi-zone festival layout with RFID tracking", description: "Designed a massive tech playground featuring zero-latency streaming nodes across multiple stages." },
        { name: "Hyderabad", coords: [17.3850, 78.4867], subtitle: "Pharma Tech Symposium", year: "2024", attendees: "3,000 Delegates", setup: "3D Projection Mapping & Breakout Pods", description: "A highly technical MICE engagement bringing together global pharmaceutical pioneers." },
        { name: "Goa", coords: [15.2993, 74.1240], subtitle: "Executive Offsite Retreat", year: "2023", attendees: "400 C-Suite Leaders", setup: "Beachfront dome with acoustic isolation", description: "A secluded, high-security corporate networking retreat blending business strategy with luxury." },
        
        // International Expansion
        { name: "London, UK", coords: [51.5074, -0.1278], subtitle: "European Finance Summit", year: "2024", attendees: "1,800 Elites", setup: "Suspended LED arrays inside a historic hall", description: "Orchestrated a hyper-exclusive financial summit merging historic British architecture with cyberpunk lighting design." },
        { name: "Bali, Indonesia", coords: [-8.4095, 115.1889], subtitle: "APAC Innovators Retreat", year: "2023", attendees: "600 Leaders", setup: "Sustainable bamboo structures & bio-responsive lighting", description: "An immersive, sustainability-focused corporate retreat designed around the natural topography of the island." },
        { name: "Jakarta, Indonesia", coords: [-6.2088, 106.8456], subtitle: "SEA Trade Expo", year: "2025", attendees: "10,000+ Visitors", setup: "Multi-hall spanning modular booths", description: "A massive corporate exhibition bridging Southeast Asian commerce with global technological enterprises." },
        { name: "Dubai, UAE", coords: [25.2048, 55.2708], subtitle: "Web3 World Summit", year: "2024", attendees: "15,000+ Attendees", setup: "Immersive metaverse tunnels & 50ft LED monoliths", description: "Produced a groundbreaking tech exhibition merging digital art with massive physical architecture." },
        { name: "Singapore", coords: [1.3521, 103.8198], subtitle: "Global Tech Launch", year: "2024", attendees: "2,000 Insiders", setup: "Kinetic runway with mirrored ceiling installations", description: "Architected a razor-sharp, high-contrast environment designed specifically to amplify a flagship tech product reveal." },
        { name: "Sydney, Australia", coords: [-33.8688, 151.2093], subtitle: "Oceania Business Forum", year: "2023", attendees: "4,500 Delegates", setup: "Harborside transparent marquees & acoustic baffling", description: "Designed a massive corporate engagement overlooking the Opera House, featuring seamless multi-stage broadcasts." }
      ];

      locations.forEach(loc => {
        const marker = window.L.marker(loc.coords, { icon: customIcon })
          .addTo(map)
          .bindTooltip(loc.name, { direction: 'top', className: 'custom-tooltip', offset: [0, -10] });
          
        marker.on('click', () => {
          setActiveLocation(loc);
        });
      });
      
      // Close box if clicking elsewhere on the map
      map.on('click', () => {
        setActiveLocation(null);
      });
    };

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-[50vh] md:h-[60vh] 2xl:h-[70vh] rounded-2xl overflow-hidden border border-white/5 relative z-10 group mb-20 bg-[#050505] interactive">
      <div id="global-map" className="w-full h-full z-0 opacity-70 group-hover:opacity-100 transition-opacity duration-1000 cursor-grab active:cursor-grabbing"></div>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(5,5,5,1)] z-10"></div>
      
      {/* Interactive Location Brief Box */}
      <div className={`absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 w-[calc(100%-3rem)] md:w-[28rem] transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] shadow-2xl ${activeLocation ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        {activeLocation && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveLocation(null); }}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors interactive"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
            <div className="pr-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/40">{activeLocation.name}</p>
                <span className="font-mono text-[9px] tracking-[0.2em] text-white/30 border border-white/10 px-2 py-1 rounded-sm">{activeLocation.year}</span>
              </div>
              <h4 className="text-xl md:text-2xl 2xl:text-3xl font-wide font-extralight uppercase tracking-[0.05em] text-white mb-6 leading-tight">{activeLocation.subtitle}</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-6 border-y border-white/10 py-5">
                <div>
                  <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-white/30 mb-2">Scale</p>
                  <p className="font-sans text-[10px] tracking-[0.1em] text-white/80">{activeLocation.attendees}</p>
                </div>
                <div>
                  <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-white/30 mb-2">Setup</p>
                  <p className="font-sans text-[10px] tracking-[0.1em] text-white/80 leading-relaxed pr-2">{activeLocation.setup}</p>
                </div>
              </div>
              
              <p className="font-sans text-[10px] 2xl:text-xs tracking-[0.15em] uppercase text-white/60 leading-relaxed">
                {activeLocation.description}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const GlobalNodes = () => {
  const [ref, isVisible] = useScrollReveal();
  const nodes = [
    { city: "Pune", type: "Headquarters", email: "info@eventsandpro.com" },
    { city: "Mumbai", type: "Corporate Division", email: "info@eventsandpro.com" },
    { city: "Delhi-NCR", type: "MICE Division", email: "info@eventsandpro.com" },
    { city: "London", type: "European Operations", email: "info@eventsandpro.com" }
  ];

  return (
    <section className="py-24 2xl:py-32 px-6 md:px-12 2xl:px-24 bg-[#0a0a0a] border-b border-white/5">
      <div ref={ref} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="text-center mb-20">
          <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-6">Global Portfolio</p>
          <h2 className="text-3xl md:text-5xl 2xl:text-6xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1]">
            Strategic <span className="text-transparent custom-stroke-text font-normal">Nodes.</span>
          </h2>
        </div>
        <GlobalMap />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 2xl:gap-12">
          {nodes.map((node, i) => (
            <div key={i} className="p-10 border border-white/10 rounded-2xl hover:border-white/30 transition-colors duration-500 interactive group bg-[#050505]">
              <h3 className="text-2xl 2xl:text-3xl font-wide font-extralight uppercase tracking-[0.1em] text-white mb-2">{node.city}</h3>
              <p className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/40 mb-8">{node.type}</p>
              <p className="font-sans text-[10px] 2xl:text-xs tracking-[0.1em] text-white/70 group-hover:text-white transition-colors">{node.email}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Vision = () => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <section className="py-40 md:py-56 2xl:py-72 bg-[#050505] px-6 border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none"></div>
      <div ref={ref} className={`max-w-4xl 2xl:max-w-6xl mx-auto text-center transition-all duration-1000 ease-out relative z-10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-12">The Philosophy</p>
        <h2 className="text-3xl md:text-5xl lg:text-6xl 2xl:text-7xl font-wide font-extralight uppercase tracking-[0.08em] leading-[1.3] text-white/80">
          "Unlocking the future: Celebrating innovation and collaboration to shape a sustainable tomorrow through <span className="text-white font-normal italic">Events & Pro</span>."
        </h2>
      </div>
    </section>
  );
};

const Metrics = () => {
  const [ref, isVisible] = useScrollReveal();
  const stats = [
    { num: "280+", label: "Events Completed" },
    { num: "244+", label: "Satisfied Clients" },
    { num: "97+", label: "Respected Vendors" },
    { num: "100%", label: "Corporate Delivery" }
  ];

  return (
    <section className="bg-[#050505] border-y border-white/5 px-6 md:px-12 2xl:px-24 py-32 2xl:py-48">
      <div ref={ref} className={`max-w-[2160px] mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#0a0a0a] py-16 px-8 flex flex-col items-center justify-center text-center group interactive hover:bg-[#0d0d0d] transition-colors duration-500">
              <span className="text-4xl md:text-6xl 2xl:text-7xl font-wide font-extralight text-white mb-4 tracking-[0.05em] group-hover:scale-110 transition-transform duration-700">{stat.num}</span>
              <span className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/50">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ==========================================================================
   HOME PAGE COMPONENTS
   ========================================================================== */

const Hero = ({ setCurrentPage }) => {
  const [idx1, setIdx1] = useState(0);
  const [idx2, setIdx2] = useState(0);
  const [idx3, setIdx3] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const base1 = ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1600", "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1600", "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1600"];
  const base2 = ["https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=1600", "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1600", "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&q=80&w=1600"];
  const base3 = ["https://images.unsplash.com/photo-1470229722913-7c090be5c560?auto=format&fit=crop&q=80&w=1600", "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1600", "https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80&w=1600"];

  const col1Images = [...base1, ...base1, ...base1, ...base1];
  const col2Images = [...base2, ...base2, ...base2, ...base2];
  const col3Images = [...base3, ...base3, ...base3, ...base3];

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    const i1 = setInterval(() => setIdx1(prev => (prev < col1Images.length - 1 ? prev + 1 : prev)), 5000);
    const i2 = setInterval(() => setIdx2(prev => (prev < col2Images.length - 1 ? prev + 1 : prev)), 7000);
    const i3 = setInterval(() => setIdx3(prev => (prev < col3Images.length - 1 ? prev + 1 : prev)), 9000);

    setTimeout(() => setIdx1(1), 1500);
    setTimeout(() => setIdx2(1), 3500);
    setTimeout(() => setIdx3(1), 5500);

    return () => { clearInterval(i1); clearInterval(i2); clearInterval(i3); };
  }, [col1Images.length, col2Images.length, col3Images.length]);

  return (
    <section className="relative h-screen w-full bg-[#050505] overflow-hidden">
      <div className={`hidden md:flex absolute inset-0 w-full h-full z-0 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative w-1/3 h-full overflow-hidden border-r border-white/5">
          <div className="absolute top-0 left-0 w-full flex flex-col transition-transform duration-[2500ms] ease-[cubic-bezier(0.65,0,0.35,1)]" style={{ transform: `translateY(-${idx1 * 100}vh)` }}>
            {col1Images.map((img, i) => (
              <div key={`c1-${i}`} className="relative w-full h-screen flex-shrink-0 overflow-hidden">
                <img src={img} className="w-full h-full object-cover grayscale-[30%] animate-subtle-zoom" alt="Corporate Event" />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative w-1/3 h-full overflow-hidden border-r border-white/5">
          <div className="absolute bottom-0 left-0 w-full flex flex-col-reverse transition-transform duration-[2500ms] ease-[cubic-bezier(0.65,0,0.35,1)]" style={{ transform: `translateY(${idx2 * 100}vh)` }}>
            {col2Images.map((img, i) => (
              <div key={`c2-${i}`} className="relative w-full h-screen flex-shrink-0 overflow-hidden">
                <img src={img} className="w-full h-full object-cover grayscale-[30%] animate-subtle-zoom" style={{ animationDelay: '-3s' }} alt="Tech Summit" />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative w-1/3 h-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full flex flex-col transition-transform duration-[2500ms] ease-[cubic-bezier(0.65,0,0.35,1)]" style={{ transform: `translateY(-${idx3 * 100}vh)` }}>
            {col3Images.map((img, i) => (
              <div key={`c3-${i}`} className="relative w-full h-screen flex-shrink-0 overflow-hidden">
                <img src={img} className="w-full h-full object-cover grayscale-[30%] animate-subtle-zoom" style={{ animationDelay: '-6s' }} alt="Awards Gala" />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`flex md:hidden absolute inset-0 w-full h-full flex-col z-0 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative w-full h-1/3 overflow-hidden border-b border-white/5">
          <div className="absolute top-0 left-0 h-full flex transition-transform duration-[2500ms] ease-[cubic-bezier(0.65,0,0.35,1)]" style={{ transform: `translateX(-${idx1 * 100}vw)` }}>
            {col1Images.map((img, i) => (
              <div key={`m-c1-${i}`} className="relative w-screen h-full flex-shrink-0 overflow-hidden">
                <img src={img} className="w-full h-full object-cover grayscale-[30%] animate-subtle-zoom" alt="Corporate Event" />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative w-full h-1/3 overflow-hidden border-b border-white/5">
          <div className="absolute top-0 right-0 h-full flex flex-row-reverse transition-transform duration-[2500ms] ease-[cubic-bezier(0.65,0,0.35,1)]" style={{ transform: `translateX(${idx2 * 100}vw)` }}>
            {col2Images.map((img, i) => (
              <div key={`m-c2-${i}`} className="relative w-screen h-full flex-shrink-0 overflow-hidden">
                <img src={img} className="w-full h-full object-cover grayscale-[30%] animate-subtle-zoom" style={{ animationDelay: '-3s' }} alt="Tech Summit" />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative w-full h-1/3 overflow-hidden">
          <div className="absolute top-0 left-0 h-full flex transition-transform duration-[2500ms] ease-[cubic-bezier(0.65,0,0.35,1)]" style={{ transform: `translateX(-${idx3 * 100}vw)` }}>
            {col3Images.map((img, i) => (
              <div key={`m-c3-${i}`} className="relative w-screen h-full flex-shrink-0 overflow-hidden">
                <img src={img} className="w-full h-full object-cover grayscale-[30%] animate-subtle-zoom" style={{ animationDelay: '-6s' }} alt="Awards Gala" />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[35vh] bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none z-10"></div>

      <div className="absolute bottom-0 left-0 w-full z-20 px-6 md:px-12 2xl:px-24 h-auto md:h-[20vh] flex flex-col lg:flex-row lg:items-end justify-between pb-8 md:pb-12 pointer-events-none gap-6 2xl:gap-12 max-w-[2160px] mx-auto">
        <div className="flex flex-col justify-end lg:w-[70%] shrink-0">
          <p className={`font-sans text-[8px] md:text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/50 mb-3 md:mb-4 transition-all duration-1000 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Top Event Management Companies In India
          </p>
          <h1 className={`font-wide text-3xl md:text-5xl lg:text-6xl 2xl:text-7xl font-extralight tracking-[0.08em] text-white uppercase leading-none drop-shadow-2xl transition-all duration-1000 delay-500 whitespace-normal xl:whitespace-nowrap ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Events & Pro.
          </h1>
        </div>

        <div className={`flex flex-col lg:w-[25%] gap-5 lg:gap-6 transition-all duration-1000 delay-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="font-sans text-[9px] md:text-[10px] 2xl:text-xs tracking-[0.2em] uppercase text-white/70 leading-relaxed">
            Crafting experiential events since 2017. Specializing strictly in <span className="text-white font-medium">Corporate Events</span>, <span className="text-white font-medium">Experiential Tech</span>, and <span className="text-white font-medium">Awards Functions</span>.
          </p>
          <button onClick={() => setCurrentPage('contact')} className="pointer-events-auto interactive px-8 py-3.5 2xl:px-12 2xl:py-4 rounded-full border border-white/30 bg-white/[0.03] backdrop-blur-md font-sans text-[9px] 2xl:text-[11px] tracking-[0.3em] uppercase text-white hover:bg-white hover:text-black transition-all duration-500 shadow-xl w-fit">
            Initialize
          </button>
        </div>
      </div>
    </section>
  );
};

const Showreel = () => {
  const [ref, isVisible] = useScrollReveal(0.2);

  return (
    <section className="bg-[#050505] pt-32 2xl:pt-48 pb-32 2xl:pb-48 flex flex-col items-center w-full relative z-20 overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full overflow-hidden flex z-0 opacity-20 pointer-events-none select-none">
        <div className="flex animate-marquee w-max text-[20vw] 2xl:text-[15vw] font-wide font-extralight tracking-[0.05em] uppercase text-transparent custom-stroke-text leading-none" style={{ animationDuration: '150s' }}>
          <div className="flex whitespace-nowrap"><span className="pr-12">CORPORATE SHOWREEL • CORPORATE SHOWREEL • </span></div>
          <div className="flex whitespace-nowrap"><span className="pr-12">CORPORATE SHOWREEL • CORPORATE SHOWREEL • </span></div>
        </div>
      </div>

      <div 
        ref={ref}
        className={`w-full max-w-5xl 2xl:max-w-7xl aspect-[16/9] px-6 md:px-0 mx-auto transition-all duration-1000 delay-300 relative z-10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
      >
        <div className="w-full h-full rounded-[2rem] overflow-hidden relative group interactive cursor-none border border-white/10 animate-float shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2160" 
            alt="Corporate Showreel" 
            className="w-full h-full object-cover grayscale-[40%] transition-transform duration-[2000ms] ease-out animate-subtle-zoom" 
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 2xl:w-28 2xl:h-28 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-500">
            <Play className="text-white w-6 h-6 2xl:w-8 2xl:h-8 ml-1 opacity-90" fill="currentColor" />
          </div>
        </div>
      </div>
    </section>
  );
};

const TheProcess = () => {
  const [ref, isVisible] = useScrollReveal();
  const steps = [
    { num: "01", title: "Strategic Vision", desc: "Every engagement begins with deep strategy. We align with your brand's core ethos to engineer a compelling corporate narrative." },
    { num: "02", title: "Experiential Design", desc: "Transforming standard venues into immersive environments using cutting-edge experiential technology, light, and acoustic design." },
    { num: "03", title: "Flawless Execution", desc: "Our logistics operate invisibly. From global summits to MICE programs, microscopic attention ensures the entire experience flows seamlessly." }
  ];

  return (
    <section className="py-32 2xl:py-48 bg-[#050505] px-6 md:px-12 2xl:px-24 border-t border-white/5">
      <div ref={ref} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 2xl:mb-32 gap-10">
          <div>
            <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-6">Methodology</p>
            <h2 className="text-4xl md:text-6xl 2xl:text-7xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1]">
              The Architecture <br/> of a <span className="text-transparent custom-stroke-text font-normal">Summit.</span>
            </h2>
          </div>
          <p className="font-sans text-[10px] 2xl:text-xs tracking-[0.2em] uppercase text-white/50 max-w-sm leading-relaxed">
            A meticulous, three-phased approach to engineering corporate perfection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20 border-t border-white/10 pt-16">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col group interactive">
              <span className="text-6xl md:text-7xl 2xl:text-8xl font-wide font-thin text-transparent custom-stroke-text mb-8 transition-colors duration-700 group-hover:text-white/20">{step.num}</span>
              <h3 className="text-2xl 2xl:text-3xl font-wide font-extralight uppercase tracking-[0.1em] text-white mb-6">{step.title}</h3>
              <p className="font-sans text-[10px] 2xl:text-xs tracking-[0.15em] uppercase text-white/50 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ExpertiseSection = ({ setCurrentPage }) => {
  const [ref, isVisible] = useScrollReveal();
  const services = [
    { id: "mice", num: "01", title: "Corporate Events & MICE", desc: "Orchestrating high-stakes environments, meetings, incentives, conferences, and exhibitions for global giants. Precision and protocol.", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1600" },
    { id: "tech", num: "02", title: "Experiential Technology", desc: "Pushing the boundaries of reality with AR/VR, virtual, and hybrid events. Engaging audiences anywhere in the world.", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600" },
    { id: "awards", num: "03", title: "Awards & Entertainment", desc: "From glamorous award ceremonies to custom intellectual properties and entertainment curation. We celebrate excellence.", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1600" }
  ];

  return (
    <section className="bg-[#0a0a0a] relative py-24 lg:py-0 border-y border-white/5">
      <div className="max-w-[2160px] mx-auto px-6 md:px-12 2xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 relative">
          <div className="lg:col-span-5 lg:h-screen lg:sticky top-0 py-12 lg:py-0 flex flex-col justify-center z-10">
            <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-8">Capabilities</p>
              <h2 className="text-5xl md:text-7xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-wide font-extralight uppercase tracking-[0.08em] text-white leading-[1.1] break-words">
                Our <br/> Solutions.
              </h2>
              <p className="mt-8 font-sans text-[10px] 2xl:text-xs tracking-[0.2em] uppercase text-white/50 max-w-xs leading-relaxed">
                Expertise across the spectrum of corporate needs.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col pb-32 lg:pb-48 pt-0 lg:pt-48 gap-32 2xl:gap-48">
            {services.map((srv, idx) => (
              <div key={idx} className="flex flex-col relative group interactive" onClick={() => setCurrentPage(srv.id)}>
                <div className="w-full aspect-[4/3] md:aspect-[16/10] overflow-hidden rounded-3xl border border-white/5 bg-[#050505] relative cursor-pointer">
                  <img src={srv.img} alt={srv.title} className="w-full h-full object-cover grayscale-[40%] animate-subtle-zoom transition-transform duration-[3000ms] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors duration-700"></div>
                </div>
                <div className="mt-8 flex flex-col xl:flex-row xl:items-start justify-between gap-6 xl:gap-12 cursor-pointer">
                  <div className="xl:w-1/2">
                    <span className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.3em] uppercase text-white/40 block mb-3">Solution // {srv.num}</span>
                    <h3 className="text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-wide font-extralight uppercase tracking-[0.1em] text-white leading-tight group-hover:text-white/80 transition-colors">
                      {srv.title}
                    </h3>
                  </div>
                  <p className="font-sans text-[10px] 2xl:text-xs tracking-[0.15em] uppercase text-white/60 max-w-sm xl:w-1/2 pt-2 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const InfiniteRunway = ({ setCurrentPage }) => {
  const row1Data = [
    { img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800", category: "Corporate Events", title: "Global Tech Summit", desc: "A futuristic stage setup for over 5,000 attendees." },
    { img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800", category: "Awards Function", title: "Industry Excellence Awards", desc: "A glamorous gala celebrating top innovators." },
    { img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=800", category: "MICE", title: "Leadership Retreat", desc: "Exclusive off-site networking and strategizing." },
    { img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800", category: "Experiential Tech", title: "VR Product Launch", desc: "Immersive brand activation with AR technology." },
    { img: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&q=80&w=800", category: "Virtual Events", title: "Hybrid Symposium", desc: "Connecting 10,000 global participants in real-time." }
  ];
  
  const row2Data = [
    { img: "https://images.unsplash.com/photo-1470229722913-7c090be5c560?auto=format&fit=crop&q=80&w=800", category: "Entertainment Curation", title: "Corporate Showbiz", desc: "World-class talent performing at a corporate gala." },
    { img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800", category: "Corporate Events", title: "Innovators Gala", desc: "An awards night celebrating technological breakthroughs." },
    { img: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800", category: "MICE", title: "Executive Symposium", desc: "High-level panel discussions in an immersive venue." },
    { img: "https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80&w=800", category: "Corporate Events", title: "Fintech Convention", desc: "Sleek, ultra-modern staging for banking leaders." },
    { img: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800", category: "Experiential Tech", title: "Future of Mobility", desc: "A breathtaking holographic reveal sequence." }
  ];

  const row3Data = [
    { img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800", category: "MICE", title: "Global Team Building", desc: "Interactive workshops driving corporate synergy." },
    { img: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800", category: "Intellectual Properties", title: "Annual IP Expo", desc: "A custom-designed intellectual property exhibition." },
    { img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&q=80&w=800", category: "Awards Function", title: "Pinnacle Awards", desc: "Red carpet setup and precision show-calling." },
    { img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800", category: "Corporate Events", title: "Urban Networking", desc: "A rooftop corporate mixer overlooking the skyline." },
    { img: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=800", category: "Experiential Tech", title: "Immersive Exhibition", desc: "Interactive displays and digital art spaces." }
  ];

  const RunwayCard = ({ item, sizingClass }) => (
    <div className={`relative group interactive shrink-0 overflow-hidden rounded-2xl border border-white/5 cursor-none ${sizingClass}`}>
      <img src={item.img} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt={item.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8 2xl:p-10 pointer-events-none">
        <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <span className="font-sans text-[8px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/60 block mb-3">{item.category}</span>
          <h4 className="font-wide text-lg md:text-xl 2xl:text-2xl font-extralight uppercase tracking-[0.05em] text-white mb-3">{item.title}</h4>
          <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.15em] uppercase text-white/50 line-clamp-2 leading-relaxed">{item.desc}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-24 2xl:py-32 bg-[#050505] overflow-hidden border-y border-white/5">
      <div className="flex flex-col gap-6 2xl:gap-8">
        <div className="flex w-full overflow-hidden select-none hover-pause">
          <div className="flex animate-marquee w-max" style={{ animationDuration: '90s' }}>
            <div className="flex gap-6 2xl:gap-8 pr-6 2xl:pr-8">
              {row1Data.map((item, i) => <RunwayCard key={`r1a-${i}`} item={item} sizingClass="w-[70vw] md:w-[40vw] xl:w-[30vw] 2xl:w-[25vw] aspect-[16/9]" />)}
            </div>
            <div className="flex gap-6 2xl:gap-8 pr-6 2xl:pr-8">
              {row1Data.map((item, i) => <RunwayCard key={`r1b-${i}`} item={item} sizingClass="w-[70vw] md:w-[40vw] xl:w-[30vw] 2xl:w-[25vw] aspect-[16/9]" />)}
            </div>
          </div>
        </div>
        <div className="flex w-full overflow-hidden select-none hover-pause">
          <div className="flex animate-marquee-reverse w-max" style={{ animationDuration: '110s' }}>
            <div className="flex gap-6 2xl:gap-8 pr-6 2xl:pr-8">
              {row2Data.map((item, i) => <RunwayCard key={`r2a-${i}`} item={item} sizingClass="w-[60vw] md:w-[35vw] xl:w-[25vw] 2xl:w-[20vw] aspect-[4/3]" />)}
            </div>
            <div className="flex gap-6 2xl:gap-8 pr-6 2xl:pr-8">
              {row2Data.map((item, i) => <RunwayCard key={`r2b-${i}`} item={item} sizingClass="w-[60vw] md:w-[35vw] xl:w-[25vw] 2xl:w-[20vw] aspect-[4/3]" />)}
            </div>
          </div>
        </div>
        <div className="flex w-full overflow-hidden select-none hover-pause">
          <div className="flex animate-marquee w-max" style={{ animationDuration: '100s' }}>
            <div className="flex gap-6 2xl:gap-8 pr-6 2xl:pr-8">
              {row3Data.map((item, i) => <RunwayCard key={`r3a-${i}`} item={item} sizingClass="w-[65vw] md:w-[38vw] xl:w-[28vw] 2xl:w-[22vw] aspect-[16/10]" />)}
            </div>
            <div className="flex gap-6 2xl:gap-8 pr-6 2xl:pr-8">
              {row3Data.map((item, i) => <RunwayCard key={`r3b-${i}`} item={item} sizingClass="w-[65vw] md:w-[38vw] xl:w-[28vw] 2xl:w-[22vw] aspect-[16/10]" />)}
            </div>
          </div>
        </div>
      </div>
      <div className="text-center mt-20">
         <button onClick={() => setCurrentPage('gallery')} className="interactive border-b border-white/20 pb-2 text-[10px] font-sans tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors">
           Explore The Corporate Archive
         </button>
      </div>
    </section>
  );
};

const Clientele = () => {
  const [ref, isVisible] = useScrollReveal();
  const brands = ["Microsoft", "Mercedes-Benz", "InnovateTech", "Porsche", "Samsung", "Oracle", "IBM", "Rolex"];
  const [activeTestimonial, setActiveTestimonial] = useState(null);

  const testimonials = [
    { main: "Our corporate gala was a masterpiece. Events & Pro delivered beyond expectations, creating an unforgettable experience for our guests.", highlight: "Truly a top-tier event planning team.", author: "Sarah Thompson, CEO of InnovateTech" },
    { main: "Events & Pro didn't just host our global summit; they completely redefined our brand's physical presence.", highlight: "Absolute perfection.", author: "Global Tech CEO" },
    { main: "A masterclass in spatial architecture and experience design. They brought our tech reveal to life with", highlight: "flawless precision.", author: "VP of Marketing, Global Auto Brand" },
    { main: "They don't just plan events; they engineer memories. An absolute powerhouse in the world of", highlight: "corporate experiences.", author: "Head of Operations, Investment Bank" }
  ];

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * testimonials.length);
    setActiveTestimonial(testimonials[randomIdx]);
  }, []);

  const BrandList = () => (
    <div className="flex items-center">
      {brands.map((brand, i) => (
        <React.Fragment key={i}>
          <span className="whitespace-nowrap">{brand}</span>
          <span className="mx-8 md:mx-16 text-white/30">•</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <section className="py-32 2xl:py-48 bg-[#0a0a0a] border-t border-white/5 overflow-hidden flex flex-col items-center">
      <div className="w-full overflow-hidden flex z-0 opacity-40 pointer-events-none select-none mb-32 2xl:mb-48">
        <div className="flex animate-marquee w-max items-center text-3xl md:text-5xl 2xl:text-6xl font-wide font-extralight tracking-[0.2em] uppercase text-white leading-none" style={{ animationDuration: '120s' }}>
          <BrandList /><BrandList />
        </div>
      </div>
      <div ref={ref} className={`max-w-4xl 2xl:max-w-6xl mx-auto px-6 text-center transition-all duration-1000 ease-out ${isVisible && activeTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="flex justify-center mb-10">
          <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
        </div>
        {activeTestimonial && (
          <>
            <h3 className="text-2xl md:text-4xl 2xl:text-5xl font-wide font-extralight leading-[1.5] text-white/90 tracking-wide uppercase">
              "{activeTestimonial.main} <span className="italic font-normal">{activeTestimonial.highlight}</span>"
            </h3>
            <p className="mt-12 text-[9px] 2xl:text-[11px] font-sans tracking-[0.4em] uppercase text-white/40">— {activeTestimonial.author}</p>
          </>
        )}
      </div>
    </section>
  );
};

const HomePage = ({ setCurrentPage }) => {
  return (
    <div className="animate-fade-in">
      <Hero setCurrentPage={setCurrentPage} />
      <Showreel />
      <TheProcess />
      <ExpertiseSection setCurrentPage={setCurrentPage} />
      <InfiniteRunway setCurrentPage={setCurrentPage} />
      <Clientele />
    </div>
  );
};

/* ==========================================================================
   ABOUT PAGE SPECIFIC 
   ========================================================================== */

const OurGenesis = () => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <section className="py-32 2xl:py-48 bg-[#0a0a0a] px-6 md:px-12 2xl:px-24 border-b border-white/5">
      <div ref={ref} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-5">
            <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-8 border-b border-white/10 pb-3 inline-block">The Genesis</p>
            <h2 className="text-7xl md:text-8xl 2xl:text-[10rem] font-wide font-extralight text-white leading-none">
              20<span className="text-transparent custom-stroke-text">17.</span>
            </h2>
          </div>
          <div className="lg:col-span-7 flex flex-col justify-end space-y-8 text-sm md:text-base 2xl:text-lg font-sans font-light text-white/60 leading-relaxed max-w-3xl">
            <p>
              Events & Pro was born from a singular obsession: to transcend the mundane in the corporate world. What began as an intimate endeavor to redefine corporate gatherings for blue-chip IT giants quickly evolved into a nationwide movement.
            </p>
            <p>
              We stripped away the excess, focusing relentlessly on spatial architecture, experiential technology, and invisible logistics. Years later, that same obsession drives every blueprint we draw and every atmosphere we curate for top-tier brands.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const CoreEthos = () => {
  const [ref, isVisible] = useScrollReveal();
  const pillars = [
    { title: "Corporate Protocol", desc: "For our elite corporate clientele, protocol and privacy are paramount. We operate under strict NDAs, ensuring your IP and strategy remain entirely yours." },
    { title: "Microscopic Precision", desc: "Scale means nothing without detail. From the acoustic resonance of a keynote hall to the seamless flow of virtual platforms, we engineer perfection." },
    { title: "Infinite Scale", desc: "Whether orchestrating a highly sensitive boardroom retreat for 50 or a global tech summit for 50,000, our logistical framework scales flawlessly." }
  ];

  return (
    <section className="py-32 2xl:py-48 bg-[#050505] px-6 md:px-12 2xl:px-24">
      <div ref={ref} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-16 md:mb-24 text-center">The Framework</p>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-y border-white/10">
          {pillars.map((pillar, i) => (
            <div key={i} className="py-16 md:py-20 md:px-12 2xl:px-16 flex flex-col group interactive cursor-none">
               <h3 className="text-2xl 2xl:text-3xl font-wide font-extralight uppercase tracking-[0.1em] text-white mb-6 group-hover:pl-4 transition-all duration-500">{pillar.title}</h3>
               <p className="font-sans text-xs 2xl:text-sm tracking-[0.15em] uppercase text-white/40 leading-relaxed group-hover:text-white/70 transition-colors duration-500">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TheStudio = () => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <section className="relative h-[70vh] 2xl:h-[80vh] w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center px-6 border-y border-white/5">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2160" className="w-full h-full object-cover grayscale opacity-30 animate-subtle-zoom" alt="The Studio" />
        <div className="absolute inset-0 bg-[#050505]/80"></div>
      </div>
      <div ref={ref} className={`relative z-10 text-center transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
         <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-8">People-First Approach</p>
         <h2 className="text-5xl md:text-7xl 2xl:text-8xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-none mb-6">
            The Innovation <span className="text-transparent custom-stroke-text font-normal">Lab.</span>
         </h2>
         <p className="font-sans text-xs 2xl:text-sm tracking-[0.2em] uppercase text-white/60 max-w-xl mx-auto leading-relaxed">
           A warm, collaborative team that listens, understands, and brings your corporate ideas to life through experiential technology.
         </p>
      </div>
    </section>
  );
};

const DirectorProfileRedesigned = () => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <section className="py-32 2xl:py-48 bg-[#0a0a0a] px-6 md:px-12 2xl:px-24 border-b border-white/5 overflow-hidden">
      <div ref={ref} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-end">
          
          <div className="lg:col-span-6 flex flex-col">
            <h3 className="text-5xl md:text-7xl 2xl:text-8xl font-wide font-extralight uppercase tracking-[0.05em] text-white mb-16 leading-[1.1] z-10 relative">
              "Experience <br/> <span className="font-medium text-transparent custom-stroke-text italic">elevated.</span>"
            </h3>
            <div className="w-full aspect-[3/4] overflow-hidden rounded-2xl relative shadow-2xl interactive cursor-none group border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800" 
                alt="Corporate Leadership"
                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 animate-subtle-zoom"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none"></div>
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 pb-12 lg:pb-24">
            <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-10 border-b border-white/10 pb-3 inline-block">Our Leadership</p>
            <div className="space-y-8 text-sm md:text-base 2xl:text-lg font-sans font-light text-white/60 leading-relaxed max-w-xl">
              <p>Visionaries in the realm of high-stakes corporate event architecture, bridging an innate passion for brand storytelling with meticulous logistical precision.</p>
              <p>Under this direction, Events & Pro has grown into a national powerhouse, engineering environments that challenge the boundaries of reality and corporate engagement.</p>
              <p>We believe that the finest summits are not merely attended—they are profoundly felt. The true signature of this work lies in the invisible orchestration of perfection.</p>
            </div>
            <div className="mt-16 pt-8 border-t border-white/10 inline-block w-fit">
              <p className="text-white font-sans tracking-[0.3em] uppercase text-xs 2xl:text-sm font-semibold">Leadership</p>
              <p className="text-white/40 font-sans text-[9px] 2xl:text-[10px] tracking-[0.4em] uppercase mt-2">Events & Pro.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const TeamSection = () => {
  const [ref, isVisible] = useScrollReveal();
  
  const team1 = [
    { name: "Arjun Mehta", role: "Managing Director", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800" },
    { name: "Sarah Jenkins", role: "Head of Experiential Tech", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" },
    { name: "Vikram Singh", role: "VP of Global MICE", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" },
    { name: "Elena Rossi", role: "Lead Event Architect", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800" },
    { name: "David Chen", role: "Technical Director", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800" }
  ];

  const team2 = [
    { name: "Priya Sharma", role: "Creative Director", img: "https://images.unsplash.com/photo-1598550874175-4d0ef43ee90d?auto=format&fit=crop&q=80&w=800" },
    { name: "James Wilson", role: "Logistics Head", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800" },
    { name: "Aisha Patel", role: "Client Relations", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800" },
    { name: "Marcus Torres", role: "Audio-Visual Lead", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800" },
    { name: "Nina Ivanova", role: "Design Specialist", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800" }
  ];

  const TeamCard = ({ item, sizingClass }) => (
    <div className={`relative group interactive shrink-0 overflow-hidden rounded-[2rem] border border-white/5 cursor-none ${sizingClass}`}>
      <img 
        src={item.img} 
        alt={item.name} 
        className="w-full h-full object-cover grayscale-[60%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
      />
      <div className="absolute inset-0 bg-[#050505]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center pointer-events-none p-6 text-center">
        <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-out">
          <h4 className="text-xl md:text-2xl 2xl:text-3xl font-wide font-extralight uppercase tracking-[0.1em] text-white mb-2">{item.name}</h4>
          <p className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.2em] uppercase text-white/60">{item.role}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-32 2xl:py-48 bg-[#0a0a0a] overflow-hidden pb-48 border-b border-white/5">
      <div ref={ref} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="text-center mb-20 md:mb-32 px-6">
          <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-6">The Collective</p>
          <h2 className="text-4xl md:text-6xl 2xl:text-7xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1]">
            Architects of <span className="text-transparent custom-stroke-text font-normal">the Magic.</span>
          </h2>
        </div>

        <div className="flex flex-col gap-6 2xl:gap-8">
          <div className="flex w-full overflow-hidden select-none hover-pause">
            <div className="flex animate-marquee w-max" style={{ animationDuration: '60s' }}>
              <div className="flex gap-6 2xl:gap-8 pr-6 2xl:pr-8">
                {team1.map((item, i) => <TeamCard key={`t1a-${i}`} item={item} sizingClass="w-[70vw] md:w-[35vw] xl:w-[25vw] 2xl:w-[20vw] aspect-[4/3]" />)}
              </div>
              <div className="flex gap-6 2xl:gap-8 pr-6 2xl:pr-8">
                {team1.map((item, i) => <TeamCard key={`t1b-${i}`} item={item} sizingClass="w-[70vw] md:w-[35vw] xl:w-[25vw] 2xl:w-[20vw] aspect-[4/3]" />)}
              </div>
            </div>
          </div>
          <div className="flex w-full overflow-hidden select-none hover-pause">
            <div className="flex animate-marquee-reverse w-max" style={{ animationDuration: '70s' }}>
              <div className="flex gap-6 2xl:gap-8 pr-6 2xl:pr-8">
                {team2.map((item, i) => <TeamCard key={`t2a-${i}`} item={item} sizingClass="w-[70vw] md:w-[35vw] xl:w-[25vw] 2xl:w-[20vw] aspect-[4/3]" />)}
              </div>
              <div className="flex gap-6 2xl:gap-8 pr-6 2xl:pr-8">
                {team2.map((item, i) => <TeamCard key={`t2b-${i}`} item={item} sizingClass="w-[70vw] md:w-[35vw] xl:w-[25vw] 2xl:w-[20vw] aspect-[4/3]" />)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

const AboutPage = () => {
  return (
    <div className="animate-fade-in pt-32 lg:pt-48 bg-[#050505]">
      <section className="px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto pb-32">
        <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-8">Our Story</p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl 2xl:text-9xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1]">
          Designing <br/> <span className="text-transparent custom-stroke-text font-normal">Legacy.</span>
        </h1>
      </section>
      <Vision />
      <OurGenesis />
      <CoreEthos />
      <DirectorProfileRedesigned />
      <TeamSection />
      <TheStudio />
      <Metrics />
      <GlobalNodes />
    </div>
  );
};

/* ==========================================================================
   DEDICATED DOMAIN DETAILED PAGES
   ========================================================================== */

const MicePage = ({ setCurrentPage }) => {
  const [ref1, isVisible1] = useScrollReveal();
  const [ref2, isVisible2] = useScrollReveal();

  return (
    <div className="animate-fade-in pt-32 lg:pt-48 bg-[#050505] min-h-screen">
      {/* Detail Hero */}
      <section className="px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto pb-24 border-b border-white/5">
        <button onClick={() => setCurrentPage('expertise')} className="interactive mb-12 flex items-center text-[9px] font-sans tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 mr-3 rotate-180" /> Back to Domains
        </button>
        <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-8">Domain // 01</p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl 2xl:text-9xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1] mb-16">
          Corporate <br/> <span className="text-transparent custom-stroke-text font-normal">& MICE.</span>
        </h1>
        <div ref={ref1} className={`w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-3xl relative border border-white/5 shadow-2xl transition-all duration-1000 ease-out ${isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2160" className="w-full h-full object-cover grayscale-[30%] animate-subtle-zoom" alt="Corporate & MICE" />
        </div>
      </section>

      {/* Intro & Metrics */}
      <section className="py-24 2xl:py-32 px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-wide font-extralight uppercase tracking-[0.05em] text-white mb-8">Architecting <br/>Authority.</h2>
            <p className="font-sans text-sm 2xl:text-base tracking-[0.1em] text-white/60 leading-relaxed mb-6">
              We specialize in crafting hyper-secure, immersive environments for Fortune 500 companies, meetings, incentives, conferences, and exhibitions.
            </p>
            <p className="font-sans text-sm 2xl:text-base tracking-[0.1em] text-white/60 leading-relaxed">
              Every detail is engineered to command attention and seamlessly translate complex brand narratives into physical, awe-inspiring reality.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 bg-white/5 p-10 rounded-3xl border border-white/10">
            <div>
              <span className="block text-4xl 2xl:text-5xl font-wide font-extralight text-white mb-3">150+</span>
              <span className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/40">MICE Executed</span>
            </div>
            <div>
              <span className="block text-4xl 2xl:text-5xl font-wide font-extralight text-white mb-3">80K</span>
              <span className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/40">Delegates Hosted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Specialized Engagements Grid */}
      <section className="py-24 2xl:py-32 bg-[#0a0a0a] border-y border-white/5 px-6 md:px-12 2xl:px-24">
         <div ref={ref2} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
           <h3 className="text-2xl md:text-3xl font-wide font-extralight uppercase tracking-[0.1em] text-white mb-16 text-center">Specialized Engagements</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 2xl:gap-12">
             {[
               { img: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800", title: "Global Conferences" },
               { img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800", title: "Incentive Retreats" },
               { img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=800", title: "Corporate Exhibitions" }
             ].map((svc, idx) => (
               <div key={idx} className="group interactive cursor-none relative rounded-2xl overflow-hidden border border-white/5 aspect-[4/5]">
                 <img src={svc.img} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt={svc.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                 <div className="absolute bottom-8 left-8">
                   <h4 className="text-xl 2xl:text-2xl font-wide font-extralight uppercase tracking-[0.05em] text-white">{svc.title}</h4>
                 </div>
               </div>
             ))}
           </div>
         </div>
      </section>
      
      {/* CTA */}
      <section className="py-32 text-center px-6">
        <h3 className="text-3xl md:text-5xl font-wide font-extralight uppercase tracking-[0.05em] text-white mb-10">Architect Your Next Summit</h3>
        <button onClick={() => setCurrentPage('contact')} className="interactive px-12 py-4 rounded-full border border-white/30 bg-white/[0.03] backdrop-blur-md font-sans text-[10px] tracking-[0.3em] uppercase text-white hover:bg-white hover:text-black transition-all duration-500">
          Initialize Sequence
        </button>
      </section>
    </div>
  );
};

const TechPage = ({ setCurrentPage }) => {
  const [ref1, isVisible1] = useScrollReveal();
  const [ref2, isVisible2] = useScrollReveal();

  return (
    <div className="animate-fade-in pt-32 lg:pt-48 bg-[#050505] min-h-screen">
      {/* Detail Hero */}
      <section className="px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto pb-24 border-b border-white/5">
        <button onClick={() => setCurrentPage('expertise')} className="interactive mb-12 flex items-center text-[9px] font-sans tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 mr-3 rotate-180" /> Back to Domains
        </button>
        <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-8">Domain // 02</p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl 2xl:text-9xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1] mb-16">
          Experiential <br/> <span className="text-transparent custom-stroke-text font-normal">Technology.</span>
        </h1>
        <div ref={ref1} className={`w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-3xl relative border border-white/5 shadow-2xl transition-all duration-1000 ease-out ${isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2160" className="w-full h-full object-cover grayscale-[30%] animate-subtle-zoom" alt="Experiential Technology" />
        </div>
      </section>

      {/* Intro & Metrics */}
      <section className="py-24 2xl:py-32 px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-wide font-extralight uppercase tracking-[0.05em] text-white mb-8">Future <br/>Forward.</h2>
            <p className="font-sans text-sm 2xl:text-base tracking-[0.1em] text-white/60 leading-relaxed mb-6">
              The experiential marketing space is evolving at an unimaginable pace. We integrate AR, VR, and hybrid event streaming to connect global audiences.
            </p>
            <p className="font-sans text-sm 2xl:text-base tracking-[0.1em] text-white/60 leading-relaxed">
              Industries embrace the 'new' normal, sparking evolving ideas in experiential spaces that we translate into mind-bending physical and digital events.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 bg-white/5 p-10 rounded-3xl border border-white/10">
            <div>
              <span className="block text-4xl 2xl:text-5xl font-wide font-extralight text-white mb-3">50+</span>
              <span className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/40">Virtual Spaces</span>
            </div>
            <div>
              <span className="block text-4xl 2xl:text-5xl font-wide font-extralight text-white mb-3">100%</span>
              <span className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/40">Seamless Tech</span>
            </div>
          </div>
        </div>
      </section>

      {/* Specialized Engagements Grid */}
      <section className="py-24 2xl:py-32 bg-[#0a0a0a] border-y border-white/5 px-6 md:px-12 2xl:px-24">
         <div ref={ref2} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
           <h3 className="text-2xl md:text-3xl font-wide font-extralight uppercase tracking-[0.1em] text-white mb-16 text-center">Specialized Engagements</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 2xl:gap-12">
             {[
               { img: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=800", title: "Virtual & Hybrid Events" },
               { img: "https://images.unsplash.com/photo-1610465299993-e6675c9f9fac?auto=format&fit=crop&q=80&w=800", title: "AR / VR Activations" },
               { img: "https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80&w=800", title: "Product Reveals" }
             ].map((svc, idx) => (
               <div key={idx} className="group interactive cursor-none relative rounded-2xl overflow-hidden border border-white/5 aspect-[4/5]">
                 <img src={svc.img} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt={svc.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                 <div className="absolute bottom-8 left-8">
                   <h4 className="text-xl 2xl:text-2xl font-wide font-extralight uppercase tracking-[0.05em] text-white">{svc.title}</h4>
                 </div>
               </div>
             ))}
           </div>
         </div>
      </section>
      
      {/* CTA */}
      <section className="py-32 text-center px-6">
        <h3 className="text-3xl md:text-5xl font-wide font-extralight uppercase tracking-[0.05em] text-white mb-10">Commission Your Tech Launch</h3>
        <button onClick={() => setCurrentPage('contact')} className="interactive px-12 py-4 rounded-full border border-white/30 bg-white/[0.03] backdrop-blur-md font-sans text-[10px] tracking-[0.3em] uppercase text-white hover:bg-white hover:text-black transition-all duration-500">
          Initialize Sequence
        </button>
      </section>
    </div>
  );
};

const AwardsPage = ({ setCurrentPage }) => {
  const [ref1, isVisible1] = useScrollReveal();
  const [ref2, isVisible2] = useScrollReveal();

  return (
    <div className="animate-fade-in pt-32 lg:pt-48 bg-[#050505] min-h-screen">
      {/* Detail Hero */}
      <section className="px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto pb-24 border-b border-white/5">
        <button onClick={() => setCurrentPage('expertise')} className="interactive mb-12 flex items-center text-[9px] font-sans tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 mr-3 rotate-180" /> Back to Domains
        </button>
        <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-8">Domain // 03</p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl 2xl:text-9xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1] mb-16">
          Awards & <br/> <span className="text-transparent custom-stroke-text font-normal">Entertainment.</span>
        </h1>
        <div ref={ref1} className={`w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-3xl relative border border-white/5 shadow-2xl transition-all duration-1000 ease-out ${isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <img src="https://images.unsplash.com/photo-1470229722913-7c090be5c560?auto=format&fit=crop&q=80&w=2160" className="w-full h-full object-cover grayscale-[30%] animate-subtle-zoom" alt="Awards and Entertainment" />
        </div>
      </section>

      {/* Intro & Metrics */}
      <section className="py-24 2xl:py-32 px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-wide font-extralight uppercase tracking-[0.05em] text-white mb-8">Celebrating <br/>Excellence.</h2>
            <p className="font-sans text-sm 2xl:text-base tracking-[0.1em] text-white/60 leading-relaxed mb-6">
              Award ceremonies now shine across both entertainment and business industries. We tailor perfect entertainment curation to match your corporate audience.
            </p>
            <p className="font-sans text-sm 2xl:text-base tracking-[0.1em] text-white/60 leading-relaxed">
              We thrive on big ideas, delivering any Intellectual Property (IP) you envision. Creating massive audiovisual landscapes for live corporate entertainment.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 bg-white/5 p-10 rounded-3xl border border-white/10">
            <div>
              <span className="block text-4xl 2xl:text-5xl font-wide font-extralight text-white mb-3">100+</span>
              <span className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/40">Gala Dinners</span>
            </div>
            <div>
              <span className="block text-4xl 2xl:text-5xl font-wide font-extralight text-white mb-3">40+</span>
              <span className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/40">Custom IPs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Specialized Engagements Grid */}
      <section className="py-24 2xl:py-32 bg-[#0a0a0a] border-y border-white/5 px-6 md:px-12 2xl:px-24">
         <div ref={ref2} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
           <h3 className="text-2xl md:text-3xl font-wide font-extralight uppercase tracking-[0.1em] text-white mb-16 text-center">Specialized Engagements</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 2xl:gap-12">
             {[
               { img: "https://images.unsplash.com/photo-1540039155733-d7696c45133a?auto=format&fit=crop&q=80&w=800", title: "Award Functions" },
               { img: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800", title: "Entertainment Curation" },
               { img: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800", title: "Intellectual Properties" }
             ].map((svc, idx) => (
               <div key={idx} className="group interactive cursor-none relative rounded-2xl overflow-hidden border border-white/5 aspect-[4/5]">
                 <img src={svc.img} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt={svc.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                 <div className="absolute bottom-8 left-8">
                   <h4 className="text-xl 2xl:text-2xl font-wide font-extralight uppercase tracking-[0.05em] text-white">{svc.title}</h4>
                 </div>
               </div>
             ))}
           </div>
         </div>
      </section>
      
      {/* CTA */}
      <section className="py-32 text-center px-6">
        <h3 className="text-3xl md:text-5xl font-wide font-extralight uppercase tracking-[0.05em] text-white mb-10">Architect Your Stage</h3>
        <button onClick={() => setCurrentPage('contact')} className="interactive px-12 py-4 rounded-full border border-white/30 bg-white/[0.03] backdrop-blur-md font-sans text-[10px] tracking-[0.3em] uppercase text-white hover:bg-white hover:text-black transition-all duration-500">
          Initialize Sequence
        </button>
      </section>
    </div>
  );
};


/* ==========================================================================
   EXPERTISE OVERVIEW PAGE
   ========================================================================== */

const ExpertiseHero = () => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <section className="px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto pb-24 md:pb-32 border-b border-white/5">
      <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-8">Our Domains</p>
      <h1 className="text-5xl md:text-7xl lg:text-8xl 2xl:text-9xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1] mb-16">
        Architecting <br/> <span className="text-transparent custom-stroke-text font-normal">Realities.</span>
      </h1>
      <div 
        ref={ref}
        className={`w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-3xl relative transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2160" className="w-full h-full object-cover grayscale-[30%] animate-subtle-zoom" alt="Domain Hero" />
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      </div>
    </section>
  );
};

const DomainCorporate = ({ setCurrentPage }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <section className="py-24 md:py-40 bg-[#0a0a0a] border-b border-white/5 overflow-hidden">
      <div className="w-full overflow-hidden flex z-0 opacity-[0.07] pointer-events-none select-none mb-20 hover-pause">
        <div className="flex animate-marquee w-max items-center text-[12vw] font-wide font-extralight tracking-[0.1em] uppercase text-white leading-none" style={{ animationDuration: '80s' }}>
          <div className="flex whitespace-nowrap"><span className="pr-12">CORPORATE EVENTS • MICE • SUMMITS • </span></div>
          <div className="flex whitespace-nowrap"><span className="pr-12">CORPORATE EVENTS • MICE • SUMMITS • </span></div>
        </div>
      </div>

      <div ref={ref} className={`px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-6xl md:text-8xl font-wide font-thin text-transparent custom-stroke-text mb-8">01</span>
            <h2 className="text-4xl md:text-6xl 2xl:text-7xl font-wide font-extralight uppercase tracking-[0.05em] text-white mb-10 leading-[1.1]">Corporate <br/> & MICE.</h2>
            <p className="font-sans text-xs 2xl:text-sm tracking-[0.15em] uppercase text-white/60 leading-relaxed mb-8">
              We engineer high-stakes environments for the world's most demanding corporate giants. From hyper-secure meetings to massive 5,000-attendee conferences.
            </p>
            <p className="font-sans text-xs 2xl:text-sm tracking-[0.15em] uppercase text-white/40 leading-relaxed mb-16">
              Our methodology merges spatial psychology with cutting-edge audiovisual integration to keep audiences deeply engaged and amplify brand narratives.
            </p>
            
            <button onClick={() => setCurrentPage('mice')} className="interactive mb-16 px-8 py-4 rounded-full border border-white/30 bg-white/[0.03] backdrop-blur-md font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white hover:bg-white hover:text-black transition-all duration-500 shadow-xl w-fit">
              Explore MICE Details
            </button>

            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <span className="block text-3xl 2xl:text-4xl font-wide font-extralight text-white mb-3">150+</span>
                <span className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/40">Global Events</span>
              </div>
              <div>
                <span className="block text-3xl 2xl:text-4xl font-wide font-extralight text-white mb-3">120+</span>
                <span className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/40">Brand Partners</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-8">
            <div className="md:col-span-2 aspect-[16/9] overflow-hidden rounded-3xl group interactive cursor-none border border-white/5" onClick={() => setCurrentPage('mice')}>
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Corporate Main" />
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-3xl group interactive cursor-none border border-white/5" onClick={() => setCurrentPage('mice')}>
              <img src="https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Corporate Detail 1" />
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-3xl group interactive cursor-none border border-white/5" onClick={() => setCurrentPage('mice')}>
              <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Corporate Detail 2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const DomainTech = ({ setCurrentPage }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <section className="py-24 md:py-40 bg-[#050505] overflow-hidden border-b border-white/5">
      <div className="w-full overflow-hidden flex z-0 opacity-[0.07] pointer-events-none select-none mb-20 hover-pause">
        <div className="flex animate-marquee-reverse w-max items-center text-[12vw] font-wide font-extralight tracking-[0.1em] uppercase text-white leading-none" style={{ animationDuration: '90s' }}>
          <div className="flex whitespace-nowrap"><span className="pr-12">EXPERIENTIAL TECH • VIRTUAL EVENTS • HYBRID • </span></div>
          <div className="flex whitespace-nowrap"><span className="pr-12">EXPERIENTIAL TECH • VIRTUAL EVENTS • HYBRID • </span></div>
        </div>
      </div>

      <div ref={ref} className={`px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1 grid grid-cols-2 gap-6 2xl:gap-8 h-full">
            <div className="flex flex-col gap-6 2xl:gap-8 pt-12 lg:pt-20">
               <div className="aspect-[3/4] overflow-hidden rounded-3xl group interactive cursor-none border border-white/5" onClick={() => setCurrentPage('tech')}>
                 <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Tech 1" />
               </div>
               <div className="aspect-square overflow-hidden rounded-3xl group interactive cursor-none border border-white/5" onClick={() => setCurrentPage('tech')}>
                 <img src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Tech 2" />
               </div>
            </div>
            <div className="flex flex-col gap-6 2xl:gap-8 pb-12 lg:pb-20">
               <div className="aspect-square overflow-hidden rounded-3xl group interactive cursor-none border border-white/5" onClick={() => setCurrentPage('tech')}>
                 <img src="https://images.unsplash.com/photo-1610465299993-e6675c9f9fac?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Tech 3" />
               </div>
               <div className="aspect-[3/4] overflow-hidden rounded-3xl group interactive cursor-none border border-white/5" onClick={() => setCurrentPage('tech')}>
                 <img src="https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Tech 4" />
               </div>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col order-1 lg:order-2 lg:pl-10">
            <span className="text-6xl md:text-8xl font-wide font-thin text-transparent custom-stroke-text mb-8">02</span>
            <h2 className="text-4xl md:text-6xl 2xl:text-7xl font-wide font-extralight uppercase tracking-[0.05em] text-white mb-10 leading-[1.1]">Experiential <br/> Tech.</h2>
            <p className="font-sans text-xs 2xl:text-sm tracking-[0.15em] uppercase text-white/60 leading-relaxed mb-8">
              Curating ultra-modern, personalized brand activations that transcend the ordinary. Every AR element, virtual stream, and interactive choice is flawlessly executed.
            </p>
            <p className="font-sans text-xs 2xl:text-sm tracking-[0.15em] uppercase text-white/40 leading-relaxed mb-10">
              We embrace the 'new' normal, creating massive digital and physical hybrid event environments.
            </p>

            <button onClick={() => setCurrentPage('tech')} className="interactive mb-16 px-8 py-4 rounded-full border border-white/30 bg-white/[0.03] backdrop-blur-md font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white hover:bg-white hover:text-black transition-all duration-500 shadow-xl w-fit">
              Explore Tech Details
            </button>

            <ul className="space-y-6 border-t border-white/10 pt-10">
              {['AR / VR Activations', 'Hybrid Streaming Nodes', 'Custom Platform Architecture', 'Digital IP Generation'].map((item, i) => (
                <li key={i} className="flex items-center text-[10px] 2xl:text-[11px] font-sans tracking-[0.2em] uppercase text-white/70">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full mr-6"></div>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

const DomainAwards = ({ setCurrentPage }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <section className="py-24 md:py-40 bg-[#0a0a0a] border-b border-white/5 overflow-hidden">
      <div className="w-full overflow-hidden flex z-0 opacity-[0.07] pointer-events-none select-none mb-20 hover-pause">
        <div className="flex animate-marquee w-max items-center text-[12vw] font-wide font-extralight tracking-[0.1em] uppercase text-white leading-none" style={{ animationDuration: '70s' }}>
          <div className="flex whitespace-nowrap"><span className="pr-12">AWARDS & ENTERTAINMENT • IPS • GALA • </span></div>
          <div className="flex whitespace-nowrap"><span className="pr-12">AWARDS & ENTERTAINMENT • IPS • GALA • </span></div>
        </div>
      </div>

      <div ref={ref} className={`px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-10">
          <div className="flex flex-col">
             <span className="text-6xl md:text-8xl font-wide font-thin text-transparent custom-stroke-text mb-8">03</span>
             <h2 className="text-4xl md:text-6xl 2xl:text-7xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1] mb-8">Awards <br/> & IPs.</h2>
             <button onClick={() => setCurrentPage('awards')} className="interactive px-8 py-4 rounded-full border border-white/30 bg-white/[0.03] backdrop-blur-md font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white hover:bg-white hover:text-black transition-all duration-500 shadow-xl w-fit mt-4">
              Explore Awards Details
            </button>
          </div>
          <p className="font-sans text-xs 2xl:text-sm tracking-[0.15em] uppercase text-white/50 leading-relaxed max-w-md lg:text-right">
            Engineering massive audiovisual landscapes for corporate entertainment. From high-profile award functions to massive custom intellectual properties.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 2xl:gap-8">
           <div className="lg:col-span-2 aspect-[16/9] lg:aspect-auto overflow-hidden rounded-3xl group interactive cursor-none border border-white/5" onClick={() => setCurrentPage('awards')}>
             <img src="https://images.unsplash.com/photo-1470229722913-7c090be5c560?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Awards Main" />
           </div>
           <div className="flex flex-col gap-6 2xl:gap-8">
             <div className="aspect-[16/9] lg:aspect-auto lg:flex-1 overflow-hidden rounded-3xl group interactive cursor-none border border-white/5" onClick={() => setCurrentPage('awards')}>
               <img src="https://images.unsplash.com/photo-1540039155733-d7696c45133a?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Awards Detail 1" />
             </div>
             <div className="aspect-[16/9] lg:aspect-auto lg:flex-1 overflow-hidden rounded-3xl group interactive cursor-none border border-white/5" onClick={() => setCurrentPage('awards')}>
               <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Awards Detail 2" />
             </div>
           </div>
        </div>
      </div>
    </section>
  );
};

const CapabilitiesMatrix = () => {
  const [ref, isVisible] = useScrollReveal();
  const capabilities = [
    { title: "Corporate Events", details: "MICE, Summits, Strategic Networking" },
    { title: "Experiential Tech", details: "AR/VR, Hybrid Event Portals, 3D Mapping" },
    { title: "Venue Manufacturing", details: "Stage Design, Fabrication, Custom Sets" },
    { title: "Content Creation", details: "Corporate Video Production, Showreels" },
    { title: "Talent & Showbiz", details: "Entertainment Curation, IP Generation" },
    { title: "Invisible Logistics", details: "Freight, Procurement, Security Protocols" }
  ];

  return (
    <section className="py-32 2xl:py-48 bg-[#050505] px-6 md:px-12 2xl:px-24">
      <div ref={ref} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-16 text-center">Service Matrix</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 lg:gap-y-24 border-t border-white/10 pt-16">
          {capabilities.map((cap, i) => (
            <div key={i} className="flex flex-col interactive group cursor-none">
              <div className="w-full h-[1px] bg-white/10 mb-8 group-hover:bg-white/30 transition-colors duration-500 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-[800ms] ease-out"></div>
              </div>
              <h4 className="text-xl md:text-2xl 2xl:text-3xl font-wide font-extralight uppercase tracking-[0.1em] text-white mb-4 group-hover:pl-3 transition-all duration-500">{cap.title}</h4>
              <p className="font-sans text-[10px] 2xl:text-[11px] tracking-[0.15em] uppercase text-white/40 leading-relaxed group-hover:text-white/70 transition-colors duration-500">{cap.details}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ExpertisePage = ({ setCurrentPage }) => {
  return (
    <div className="animate-fade-in pt-32 lg:pt-48 bg-[#050505]">
       <ExpertiseHero />
       <DomainCorporate setCurrentPage={setCurrentPage} />
       <DomainTech setCurrentPage={setCurrentPage} />
       <DomainAwards setCurrentPage={setCurrentPage} />
       <CapabilitiesMatrix />
    </div>
  );
};

/* ==========================================================================
   GALLERY PAGE
   ========================================================================== */

const GalleryPage = () => {
  const [filter, setFilter] = useState('All');
  const [ref1, isVisible1] = useScrollReveal();
  const [ref2, isVisible2] = useScrollReveal();

  const filters = ['All', 'Corporate', 'Tech & Virtual', 'Awards'];

  const projects = [
    { img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800", category: "Corporate", title: "Global Tech Summit" },
    { img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=800", category: "Tech & Virtual", title: "Hybrid Symposium" },
    { img: "https://images.unsplash.com/photo-1470229722913-7c090be5c560?auto=format&fit=crop&q=80&w=800", category: "Awards", title: "Pinnacle Gala" },
    { img: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800", category: "Corporate", title: "Auto Reveal '25" },
    { img: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=800", category: "Tech & Virtual", title: "AR Brand Activation" },
    { img: "https://images.unsplash.com/photo-1540039155733-d7696c45133a?auto=format&fit=crop&q=80&w=800", category: "Awards", title: "Industry Excellence" },
    { img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800", category: "Corporate", title: "Leadership Retreat" },
    { img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800", category: "Tech & Virtual", title: "VR Product Demo" },
    { img: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800", category: "Awards", title: "Intellectual Property Expo" }
  ];

  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="animate-fade-in pt-32 lg:pt-48 bg-[#050505] min-h-screen">
      <section className="px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto pb-24 border-b border-white/5">
        <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-8">The Archive</p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl 2xl:text-9xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1]">
          Visual <br/> <span className="text-transparent custom-stroke-text font-normal">Symphony.</span>
        </h1>
      </section>

      <section className="py-24 2xl:py-32 px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto border-b border-white/5">
        <div ref={ref1} className={`transition-all duration-1000 ease-out ${isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
            <div>
              <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-4">Featured Selection</p>
              <h2 className="text-3xl md:text-5xl 2xl:text-6xl font-wide font-extralight uppercase tracking-[0.05em] text-white">Global Innovators Summit</h2>
            </div>
            <button className="interactive border-b border-white/20 pb-2 text-[10px] font-sans tracking-[0.3em] uppercase text-white hover:text-white/50 transition-colors">
              View Case Study
            </button>
          </div>
          <div className="w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-3xl relative group interactive cursor-none border border-white/5">
            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2160" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-[2000ms] group-hover:scale-105 animate-subtle-zoom" alt="Featured Project" />
            <div className="absolute inset-0 bg-black/20 pointer-events-none transition-colors duration-700 group-hover:bg-transparent"></div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 2xl:px-24 py-24 2xl:py-32 max-w-[2160px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <h3 className="text-2xl md:text-3xl font-wide font-extralight uppercase tracking-[0.1em] text-white">Curated Collection</h3>
          <div className="flex flex-wrap gap-6 md:gap-10">
            {filters.map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`interactive font-sans text-[10px] 2xl:text-xs tracking-[0.3em] uppercase transition-all duration-300 pb-2 border-b-2 ${filter === f ? 'text-white border-white' : 'text-white/40 border-transparent hover:text-white/80'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {filteredProjects.map((proj, i) => (
            <div key={`${filter}-${i}`} className={`relative overflow-hidden group interactive border border-white/5 rounded-2xl animate-fade-in ${i % 3 === 0 ? 'aspect-[3/4]' : i % 2 === 0 ? 'aspect-square' : 'aspect-[4/3]'}`}>
               <img src={proj.img} alt={proj.title} className="w-full h-full object-cover grayscale-[40%] transition-transform duration-[2000ms] group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
               <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                 <span className="font-sans text-[8px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/50 block mb-2">{proj.category}</span>
                 <h4 className="font-wide text-xl 2xl:text-2xl font-extralight uppercase tracking-[0.05em] text-white">{proj.title}</h4>
               </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 2xl:py-32 bg-[#0a0a0a] border-t border-white/5 px-6 md:px-12 2xl:px-24">
        <div ref={ref2} className={`max-w-[2160px] mx-auto transition-all duration-1000 ease-out ${isVisible2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="text-center mb-20">
            <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-6">Cinematography</p>
            <h2 className="text-4xl md:text-6xl 2xl:text-7xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1]">
              The Motion <br/> <span className="text-transparent custom-stroke-text font-normal">Vault.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 2xl:gap-12">
            {[
              { img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200", title: "Corporate Showreel '24" },
              { img: "https://images.unsplash.com/photo-1470229722913-7c090be5c560?auto=format&fit=crop&q=80&w=1200", title: "Awards & Gala Edit" }
            ].map((video, idx) => (
              <div key={idx} className="w-full aspect-[16/9] rounded-3xl overflow-hidden relative group interactive cursor-none border border-white/5 shadow-2xl">
                <img src={video.img} className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-[2000ms] group-hover:scale-105" alt={video.title} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 2xl:w-24 2xl:h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-500">
                  <Play className="text-white w-6 h-6 2xl:w-8 2xl:h-8 ml-1 opacity-90" fill="currentColor" />
                </div>
                <div className="absolute bottom-6 left-8">
                  <h4 className="font-wide text-lg 2xl:text-xl font-extralight uppercase tracking-[0.05em] text-white">{video.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ==========================================================================
   CONTACT PAGE
   ========================================================================== */

const ContactPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const faqs = [
    { q: "What is your minimum engagement scope?", a: "We specialize in grand-scale and corporate events. While we do not have a strict financial minimum, our engagements typically begin with complex spatial or logistical requirements that standard agencies cannot accommodate." },
    { q: "Do you execute international MICE commissions?", a: "Yes. With a robust network of global logistics partners and our core nodes across major cities, we have seamlessly executed corporate events and exhibitions worldwide." },
    { q: "What is the typical lead time required?", a: "For large-scale corporate summits or bespoke IP generation, we recommend a lead time of 6 to 12 months. This allows for uncompromising attention to architectural design and talent procurement." },
    { q: "Do you operate under strict NDAs?", a: "Absolute discretion is a cornerstone of our philosophy. We routinely operate under strict Non-Disclosure Agreements for our high-profile corporate elite clientele." }
  ];

  return (
    <div className="animate-fade-in pt-32 lg:pt-48 bg-[#050505] min-h-screen flex flex-col">
      <section className="px-6 md:px-12 2xl:px-24 max-w-[2160px] mx-auto w-full pb-32 border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20">
          <div className="lg:col-span-6 xl:col-span-5">
            <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-8">Initialize Sequence</p>
            <h1 className="text-5xl md:text-7xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1] mb-12">
              Connect.<br/><span className="text-transparent custom-stroke-text font-normal whitespace-nowrap">The Vision.</span>
            </h1>
            <div className="space-y-12">
              <div>
                 <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/40 mb-3 border-b border-white/10 inline-block pb-2">Direct Line</p>
                 <p className="font-sans text-sm md:text-base tracking-[0.1em] text-white font-light hover:text-white/60 transition-colors interactive w-fit cursor-pointer mb-2">info@eventsandpro.com</p>
                 <p className="font-sans text-sm md:text-base tracking-[0.1em] text-white font-light hover:text-white/60 transition-colors interactive w-fit cursor-pointer">eventsandpro@gmail.com</p>
                 <p className="font-sans text-sm md:text-base tracking-[0.1em] text-white font-light hover:text-white/60 transition-colors interactive w-fit cursor-pointer mt-4">+91 77093 56661</p>
              </div>
              <div>
                 <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/40 mb-3 border-b border-white/10 inline-block pb-2">Headquarters</p>
                 <p className="font-sans text-sm md:text-base tracking-[0.1em] text-white font-light leading-relaxed">Pune, Maharashtra<br/>India</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 xl:col-span-7 lg:pl-8 xl:pl-16">
            <form className="flex flex-col gap-12 mt-8 lg:mt-0" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/40 pl-2">Full Name</label>
                <input type="text" className="interactive bg-transparent border-b border-white/20 focus:border-white outline-none py-4 px-2 text-sm text-white font-sans transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/40 pl-2">Email Address</label>
                <input type="email" className="interactive bg-transparent border-b border-white/20 focus:border-white outline-none py-4 px-2 text-sm text-white font-sans transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/40 pl-2">Inquiry Type</label>
                <select className="interactive bg-transparent border-b border-white/20 focus:border-white outline-none py-4 px-2 text-sm text-white/80 font-sans transition-colors appearance-none rounded-none">
                  <option className="bg-black text-white">Corporate Summit / MICE</option>
                  <option className="bg-black text-white">Experiential Technology / Launch</option>
                  <option className="bg-black text-white">Awards Function / Gala</option>
                  <option className="bg-black text-white">General Inquiry</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/40 pl-2">Message</label>
                <textarea rows="4" className="interactive bg-transparent border-b border-white/20 focus:border-white outline-none py-4 px-2 text-sm text-white font-sans transition-colors resize-none"></textarea>
              </div>
              <button className="interactive w-fit mt-4 px-12 py-4 rounded-full border border-white/30 bg-white/[0.03] backdrop-blur-md font-sans text-[10px] tracking-[0.3em] uppercase text-white hover:bg-white hover:text-black transition-all duration-500">
                Transmit Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-24 2xl:py-32 px-6 md:px-12 2xl:px-24 bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-[2160px] mx-auto">
          <div className="text-center mb-20">
            <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-6">Strategic Presence</p>
            <h2 className="text-3xl md:text-5xl 2xl:text-6xl font-wide font-extralight uppercase tracking-[0.05em] text-white leading-[1.1]">
              Global <span className="text-transparent custom-stroke-text font-normal">Presence.</span>
            </h2>
          </div>
          <GlobalMap />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 2xl:gap-12">
            {[
              { city: "Pune", type: "Headquarters", email: "info@eventsandpro.com" },
              { city: "Mumbai", type: "Corporate Division", email: "info@eventsandpro.com" },
              { city: "Delhi-NCR", type: "MICE Division", email: "info@eventsandpro.com" },
              { city: "Bangalore", type: "Tech Engagements", email: "info@eventsandpro.com" }
            ].map((node, i) => (
              <div key={i} className="p-10 border border-white/10 rounded-2xl hover:border-white/30 transition-colors duration-500 interactive group bg-[#050505]">
                <h3 className="text-2xl 2xl:text-3xl font-wide font-extralight uppercase tracking-[0.1em] text-white mb-2">{node.city}</h3>
                <p className="font-sans text-[9px] 2xl:text-[10px] tracking-[0.3em] uppercase text-white/40 mb-8">{node.type}</p>
                <p className="font-sans text-[10px] 2xl:text-xs tracking-[0.1em] text-white/70 group-hover:text-white transition-colors">{node.email}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 2xl:py-32 px-6 md:px-12 2xl:px-24 bg-[#050505]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-sans text-[9px] 2xl:text-[11px] tracking-[0.4em] uppercase text-white/40 mb-4">Operations</p>
            <h2 className="text-3xl md:text-5xl font-wide font-extralight uppercase tracking-[0.05em] text-white">Engagement Protocols</h2>
          </div>
          <div className="flex flex-col border-t border-white/10">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-white/10 overflow-hidden interactive" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                <div className="py-8 flex justify-between items-center cursor-none">
                  <h4 className={`text-sm md:text-base 2xl:text-lg font-wide font-extralight uppercase tracking-[0.05em] transition-colors duration-300 pr-8 ${activeFaq === i ? 'text-white' : 'text-white/60'}`}>{faq.q}</h4>
                  <div className="text-white/40 font-mono text-xl font-light">{activeFaq === i ? '−' : '+'}</div>
                </div>
                <div className={`transition-all duration-500 ease-in-out ${activeFaq === i ? 'max-h-64 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
                  <p className="font-sans text-xs 2xl:text-sm tracking-[0.15em] uppercase text-white/40 leading-relaxed max-w-2xl">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/5 border-y border-white/10 px-6 text-center">
        <h3 className="text-xl md:text-2xl font-wide font-extralight uppercase tracking-[0.1em] text-white mb-4">Join The Architecture</h3>
        <p className="font-sans text-[10px] 2xl:text-xs tracking-[0.2em] uppercase text-white/50 max-w-xl mx-auto mb-8 leading-relaxed">
          We are always searching for visionary designers, logistical masterminds, and production specialists.
        </p>
        <a href="mailto:careers@eventsandpro.com" className="interactive border-b border-white/20 pb-2 text-[10px] font-sans tracking-[0.3em] uppercase text-white hover:text-white/50 transition-colors">
          Submit Portfolio
        </a>
      </section>
    </div>
  );
};

/* ==========================================================================
   MAIN APP ROUTER
   ========================================================================== */

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (page) => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    setCurrentPage(page);
  };

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'About Us', id: 'about' },
    { name: 'Solutions', id: 'expertise' },
    { name: 'Gallery', id: 'gallery' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <div className="bg-[#050505] min-h-screen font-sans antialiased selection:bg-white/20 selection:text-white scroll-smooth text-white flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Montserrat:wght@100;200;300;400;900&display=swap');

        .font-wide { font-family: 'Montserrat', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }

        body { cursor: none !important; overflow-x: hidden; background-color: #050505; }
        * { cursor: none !important; }

        /* Restore Native Cursors for Map and Tool Interactions */
        #global-map, .toolkit-interactive { cursor: grab !important; }
        #global-map:active, .toolkit-interactive:active { cursor: grabbing !important; }
        #global-map *, .toolkit-interactive, .toolkit-interactive * { cursor: inherit !important; }
        #global-map .leaflet-interactive, .toolkit-interactive { cursor: pointer !important; }

        .custom-stroke-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.4);
          color: transparent;
        }

        @keyframes subtleZoom { 0% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marqueeReverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .animate-subtle-zoom { animation: subtleZoom 20s ease-in-out infinite alternate; }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-marquee { animation: marquee linear infinite; }
        .animate-marquee-reverse { animation: marqueeReverse linear infinite; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 1.5s ease-out forwards; }
        
        .hover-pause:hover .animate-marquee,
        .hover-pause:hover .animate-marquee-reverse { animation-play-state: paused !important; }

        .custom-tooltip {
          background-color: rgba(5, 5, 5, 0.9) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: white !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 9px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.2em !important;
          border-radius: 4px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
          backdrop-filter: blur(10px);
        }
        .leaflet-tooltip-top:before { border-top-color: rgba(5, 5, 5, 0.9) !important; }
        .leaflet-container { background: transparent !important; }

        .cursor-dot { background-color: #ffffff; }
        .cursor-ring { border-color: rgba(255,255,255,0.4); background-color: rgba(255,255,255,0.1); }
      `}} />

      {isLoading && <Preloader finishLoading={() => setIsLoading(false)} />}

      <CustomCursor />
      <FloatingToolkit />
      
      <nav className={`fixed w-full z-[100] transition-all duration-700 px-6 md:px-12 2xl:px-24 py-6 2xl:py-8 ${scrolled || currentPage !== 'home' ? 'bg-[#050505]/95 backdrop-blur-md border-b border-white/5 py-4 2xl:py-6' : ''}`}>
        <div className="max-w-[2160px] mx-auto flex justify-between items-center text-white">
          <div className="interactive z-50 flex items-center cursor-none" onClick={() => navigateTo('home')}>
            <img 
              src="https://static.wixstatic.com/media/745981_5cb5b3705132499081e24b12f5f4b3d4~mv2.png" 
              alt="Events & Pro Logo" 
              className="h-[46px] md:h-[66px] 2xl:h-[75px] object-contain invert brightness-0 hover:opacity-70 transition-opacity" 
            />
          </div>
          <div className="hidden lg:flex items-center space-x-12 2xl:space-x-16">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => navigateTo(item.id)} 
                className={`text-[9px] 2xl:text-[11px] font-sans tracking-[0.3em] uppercase transition-colors interactive font-medium ${currentPage === item.id || (currentPage === 'mice' && item.id === 'expertise') || (currentPage === 'tech' && item.id === 'expertise') || (currentPage === 'awards' && item.id === 'expertise') ? 'text-white border-b border-white/30 pb-1' : 'text-white/50 hover:text-white pb-1 border-b border-transparent'}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          <button className="lg:hidden interactive z-50 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} strokeWidth={1} /> : <Menu size={28} strokeWidth={1} />}
          </button>
        </div>

        <div className={`fixed inset-0 bg-[#050505] z-40 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col justify-center items-center lg:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
           <div className="flex flex-col items-center space-y-10">
            {navItems.map((item, i) => (
              <button 
                key={item.id} 
                onClick={() => navigateTo(item.id)}
                className={`text-3xl font-wide font-extralight tracking-[0.1em] uppercase transition-colors interactive ${currentPage === item.id || (currentPage === 'mice' && item.id === 'expertise') || (currentPage === 'tech' && item.id === 'expertise') || (currentPage === 'awards' && item.id === 'expertise') ? 'text-white' : 'text-white/50 hover:text-white'}`}
                style={{ transitionDelay: `${i * 100}ms`, transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)', opacity: mobileMenuOpen ? 1 : 0 }}
              >
                {item.name}
              </button>
            ))}
           </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col">
        {currentPage === 'home' && <HomePage setCurrentPage={navigateTo} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'expertise' && <ExpertisePage setCurrentPage={navigateTo} />}
        {currentPage === 'mice' && <MicePage setCurrentPage={navigateTo} />}
        {currentPage === 'tech' && <TechPage setCurrentPage={navigateTo} />}
        {currentPage === 'awards' && <AwardsPage setCurrentPage={navigateTo} />}
        {currentPage === 'gallery' && <GalleryPage />}
        {currentPage === 'contact' && <ContactPage />}
      </main>

      <Footer setCurrentPage={navigateTo} />
    </div>
  );
}
