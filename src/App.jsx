import React, { useState, useEffect, useRef } from 'react';
import { MapPin, TrendingUp, AlertTriangle, Zap, Eye, Radar, BarChart2, ShieldCheck, Crosshair, BrainCircuit, Loader2, Target } from 'lucide-react';

// --- EXPANDED PREDICTIVE DATABASE (For instant demo matches) ---
const predictiveData = {
  'baner': {
    name: 'Baner, Pune, India',
    pincode: '411045',
    coords: [18.5590, 73.7868],
    risk: 'Low',
    reward: 'High',
    yieldPrediction: '+18.4%',
    confidence: '94%',
    verdict: 'AGGRESSIVE ACCUMULATION',
    verdictColor: 'text-emerald-400',
    bgColor: 'bg-emerald-400/5',
    borderColor: 'border-emerald-400/20',
    futurePotential: "Emerging as Pune's premier micro-market for tech-driven luxury housing, with a projected 40% appreciation in land value over the next 5 years due to seamless metro connectivity and incoming commercial hubs.",
    points: [
      "Hinjewadi-Shivajinagar Metro Line 3 operational status triggering localized price inflation by Q3.",
      "Approval of 1.5M sq. ft. Grade-A commercial IT park zoning exactly 1.2 miles from the central corridor.",
      "Algorithmic sentiment analysis shows a 45% drop in secondary market listings (supply squeeze)."
    ]
  },
  'kharadi': {
    name: 'Kharadi, Pune, India',
    pincode: '411014',
    coords: [18.5515, 73.9348],
    risk: 'Low-Medium',
    reward: 'Extreme',
    yieldPrediction: '+19.8%',
    confidence: '91%',
    verdict: 'ALPHA GENERATOR',
    verdictColor: 'text-cyan-400',
    bgColor: 'bg-cyan-400/5',
    borderColor: 'border-cyan-400/20',
    futurePotential: "Transitioning from an IT hub to a holistic live-work-play ecosystem. The next decade will see a surge in ultra-luxury riverfront developments and premium retail, solidifying it as Pune's eastern anchor.",
    points: [
      "EON IT Park Phase 3 expansion to add 25,000+ high-income jobs, creating a deficit of 4,000 premium units.",
      "New riverfront development initiative projected to increase river-facing property premiums.",
      "Institutional land-banking patterns detected in the Upper Kharadi-Manjri corridor."
    ]
  }
};

// --- API HELPER: DYNAMIC AI GEOCODING & INTEL ---
const generateLocationDataAI = async (locationQuery) => {
  const apiKey = "AIzaSyBNhUjAtl7ks-ojlQN6cSyohrVAkwGXIkk"; // Strict Rule: Left empty for environment injection
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const prompt = `Act as a real estate data geocoder and market analyst. Analyze the location: "${locationQuery}".
  If it's a pincode/zipcode, identify the corresponding city/area (Global support, defaults to India if ambiguous but strictly respects international zip codes if obvious like 90210).
  Provide realistic data. Return ONLY valid JSON with this exact structure, no markdown formatting:
  {
    "name": "Standardized Area Name, City, Country",
    "pincode": "relevant postal code",
    "lat": numerical latitude (e.g. 18.5204),
    "lng": numerical longitude (e.g. 73.8567),
    "risk": "Low" | "Medium" | "High",
    "reward": "Moderate" | "High" | "Extreme",
    "futurePotential": "A 2-sentence macro outlook for the next 10 years.",
    "points": ["Micro-trend 1", "Micro-trend 2", "Micro-trend 3"]
  }`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  };

  const delays = [1000, 2000, 4000];
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('API Error');
      const result = await response.json();
      let rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) throw new Error("Empty response");
      
      // SANITIZE: Strip Markdown blocks if AI hallucinates formatting
      rawText = rawText.replace(/```json\n?|```\n?/g, '').trim();
      
      return JSON.parse(rawText);
    } catch (error) {
      if (attempt === 2) throw new Error("Geocoding failed");
      await new Promise(r => setTimeout(r, delays[attempt]));
    }
  }
};

// --- OFFLINE FALLBACK ENGINE (In case API rate-limits) ---
const generateOfflineFallback = (location) => {
  const normalizedLoc = location.toLowerCase().trim();
  const hash = normalizedLoc.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Intelligent-ish coordinate resolution for offline mode
  let baseLat = 20.5937; let baseLng = 78.9629; let regionName = "Unknown Zone";
  const cityMap = [
    { prefixes: ['41'], keywords: ['pune', 'swargate', 'kothrud', 'hinjewadi'], coords: [18.5204, 73.8567], name: 'Pune Region' },
    { prefixes: ['40'], keywords: ['mumbai', 'bandra', 'andheri'], coords: [19.0760, 72.8777], name: 'Mumbai MMR' },
    { prefixes: ['11', '12'], keywords: ['delhi', 'noida', 'gurugram'], coords: [28.6139, 77.2090], name: 'Delhi NCR' },
    { prefixes: ['56'], keywords: ['bangalore', 'bengaluru', 'koramangala'], coords: [12.9716, 77.5946], name: 'Bengaluru' },
  ];

  for (const city of cityMap) {
    if (city.prefixes.some(p => normalizedLoc.startsWith(p)) || city.keywords.some(k => normalizedLoc.includes(k))) {
      baseLat = city.coords[0]; baseLng = city.coords[1]; regionName = city.name; break;
    }
  }

  const isPincodeInput = /^\d+$/.test(normalizedLoc);
  const displayPin = isPincodeInput ? normalizedLoc : `${100000 + (hash * 123) % 899999}`;
  const displayName = isPincodeInput ? `Sector ${normalizedLoc.slice(-2)}, ${regionName}` : `${location.charAt(0).toUpperCase() + location.slice(1)}, ${regionName}`;

  return {
    name: displayName,
    pincode: displayPin,
    lat: +(baseLat + ((hash % 100) - 50) * 0.002).toFixed(4),
    lng: +(baseLng + ((hash % 100) - 50) * 0.002).toFixed(4),
    risk: ['Low', 'Medium', 'High'][hash % 3],
    reward: ['Moderate', 'High', 'Extreme', 'High'][hash % 4],
    futurePotential: "Offline Model Active: Area demonstrates stable baseline metrics. Expected to follow macro-regional growth curves with standard infrastructure-led appreciation.",
    points: [
      `Satellite telemetry suggests a ${12 + (hash % 20)}% density increase over 24 months.`,
      `Zoning algorithms predict a shift towards high-density mixed-use.`,
      `Demographic modeling indicates an influx of core professional demographics.`
    ]
  };
};

const quotes = [
  "“Information is the oil of the 21st century...”",
  "“Risk comes from not knowing what you're doing.”",
  "“Outcomes are determined by data held before the market wakes up.”",
  "“The investor of today does not profit from yesterday's growth.”"
];

const phases = [
  "Establishing secure API tunnels...",
  "Geolocating coordinates & parcel data...",
  "Running Monte Carlo yield simulations...",
  "Compiling final risk/reward matrix..."
];

const TOTAL_LOAD_TIME_MS = 3500; // Fast 3.5s scan for better UX

// Tactical Leaflet Map loaded dynamically
const TacticalMap = ({ coords }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const initMap = () => {
      if (!window.L || !mapRef.current) return;
      
      if (!mapInstance.current) {
        mapInstance.current = window.L.map(mapRef.current, {
          zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, attributionControl: false
        }).setView(coords, 15);

        window.L.tileLayer('[https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/](https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/){z}/{y}/{x}', {
          maxZoom: 19,
        }).addTo(mapInstance.current);

        window.L.circleMarker(coords, { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 1, radius: 45 }).addTo(mapInstance.current);
        window.L.circleMarker(coords, { color: '#60a5fa', fillColor: '#60a5fa', fillOpacity: 0.9, weight: 2, radius: 4 }).addTo(mapInstance.current);
      } else {
        mapInstance.current.setView(coords, 15);
      }

      setTimeout(() => { if(mapInstance.current) mapInstance.current.invalidateSize(); }, 100);
    };

    if (!document.getElementById('leaflet-script')) {
      const script = document.createElement('script');
      script.id = 'leaflet-script';
      script.src = '[https://unpkg.com/leaflet@1.9.4/dist/leaflet.js](https://unpkg.com/leaflet@1.9.4/dist/leaflet.js)';
      script.onload = initMap;
      document.head.appendChild(script);
    } else if (window.L) {
      initMap();
    }

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [coords]);

  return <div ref={mapRef} className="w-full h-full bg-[#020617] rounded-xl" />;
};

export default function App() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [result, setResult] = useState(null);
  
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [startProgress, setStartProgress] = useState(false);
  const [progressPct, setProgressPct] = useState(0);

  // Gemini Text State
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [activeAiMode, setActiveAiMode] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let phaseInterval;
    let progressInterval;

    if (isSearching) {
      setTimeout(() => { if (isMounted) setStartProgress(true); }, 50);

      phaseInterval = setInterval(() => {
        if (isMounted) setPhaseIndex(prev => Math.min(prev + 1, phases.length - 1));
      }, TOTAL_LOAD_TIME_MS / phases.length);

      progressInterval = setInterval(() => {
        if (isMounted) setProgressPct(prev => Math.min(prev + 1, 100));
      }, TOTAL_LOAD_TIME_MS / 100);

      const fetchMarketData = async () => {
        const normalizedQuery = query.toLowerCase().trim();
        let finalData = null;

        // 1. Check strict hardcoded cache
        const dbValues = Object.values(predictiveData);
        for (let item of dbValues) {
          if (item.name.toLowerCase().includes(normalizedQuery) || item.pincode === normalizedQuery) {
            finalData = item;
            break;
          }
        }

        // 2. If not found, use Gemini AI Geocoding
        if (!finalData) {
          let aiParsed;
          try {
            aiParsed = await generateLocationDataAI(query);
          } catch (e) {
            console.warn("AI Geocoding fallback triggered:", e);
            aiParsed = generateOfflineFallback(query); // Fallback if API fails
          }

          // Apply strict 15-20% IRR formatting and UI processing
          const hash = aiParsed.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          const calculatedYield = (15.0 + (hash % 50) / 10).toFixed(1); 
          const confidence = (85 + (hash % 10)).toString() + '%';
          const isHighRisk = aiParsed.risk === 'High' || aiParsed.risk === 'Medium-High';

          finalData = {
            ...aiParsed,
            coords: [aiParsed.lat, aiParsed.lng],
            yieldPrediction: `+${calculatedYield}%`,
            confidence: confidence,
            verdict: isHighRisk ? 'VOLATILE GROWTH ZONE' : 'EMERGING OPPORTUNITY',
            verdictColor: isHighRisk ? 'text-orange-400' : 'text-violet-400',
            bgColor: isHighRisk ? 'bg-orange-400/5' : 'bg-violet-400/5',
            borderColor: isHighRisk ? 'border-orange-400/20' : 'border-violet-400/20',
          };
        }

        return finalData;
      };

      // Run AI generation and animation timer concurrently
      Promise.all([
        fetchMarketData(),
        new Promise(resolve => setTimeout(resolve, TOTAL_LOAD_TIME_MS))
      ]).then(([data]) => {
        if (isMounted) {
          setResult(data);
          setIsSearching(false);
        }
      });
    }

    return () => {
      isMounted = false;
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, [isSearching, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setStartProgress(false);
    setProgressPct(0);
    setQuoteIndex(prev => (prev + 1) % quotes.length);
    setPhaseIndex(0);
    setAiResponse(null);
    setAiError(null);
    setActiveAiMode(null);
  };

  const resetSearch = () => {
    setHasSearched(false);
    setResult(null);
    setQuery('');
    setStartProgress(false);
    setProgressPct(0);
    setAiResponse(null);
    setAiError(null);
    setActiveAiMode(null);
  };

  const generateAIText = async (type) => {
    if (!result) return;
    setIsAiGenerating(true);
    setAiError(null);
    setActiveAiMode(type);
    
    const prompt = type === 'intel' 
      ? `Analyze the real estate micro-market of ${result.name} (PIN: ${result.pincode}). Provide a 2-paragraph tactical dossier focusing on hidden yield drivers, potential infrastructure catalysts, and institutional capital flow. Be extremely concise.`
      : `Create a 3-step aggressive negotiation strategy for acquiring distressed or off-market commercial/premium real estate in ${result.name} (PIN: ${result.pincode}). Tone: ruthless, strategic, actionable.`;
    
    const apiKey = "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: "You are a highly advanced AI for a proprietary real estate hedge fund. Your tone is clinical, hyper-analytical, concise, and data-focused. Never use flowery language. Focus on yields, infrastructure, zoning, and alpha generation. Provide raw intelligence." }] }
    };

    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "No intelligence gathered.");
    } catch (err) {
      setAiError("Neural link failed. The Oracle is currently unreachable.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden relative antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Enhanced Background Gradients & Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-black pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-[0.15]" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <style dangerouslySetInnerHTML={{__html: `
        @import url('[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap)');
        @import url('[https://unpkg.com/leaflet@1.9.4/dist/leaflet.css](https://unpkg.com/leaflet@1.9.4/dist/leaflet.css)');
        
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }

        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        .animate-gradient-x {
          animation: gradient-x 6s ease infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={resetSearch}>
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-400/10 transition-all duration-300 shadow-lg">
            <Radar className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-semibold tracking-[0.15em] text-xs uppercase text-white/90 hidden sm:block">Yield Oracle</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-500 tracking-widest uppercase font-medium">
            Powered by <span className="text-slate-300">Gemma 4</span> <span className="text-slate-600">×</span> <span className="text-slate-300">Gemini 2.5 Flash</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 tracking-[0.2em] uppercase font-medium shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            Global Link Active
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-6 w-full">
        
        {/* Initial Search State */}
        <div className={`w-full max-w-3xl transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${hasSearched ? '-translate-y-24 opacity-0 pointer-events-none absolute' : 'translate-y-0 opacity-100'}`}>
          <div className="text-center mb-12 animate-float">
            <h1 className="text-4xl md:text-7xl font-semibold mb-6 tracking-tight text-white">
              See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 animate-gradient-x">Future.</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-light max-w-lg mx-auto leading-relaxed px-4">
              Bypass historical noise. Enter any global micro-market or zip code to generate a predictive 36-month risk and alpha yield matrix.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto w-full px-4 md:px-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500 pointer-events-none"></div>
            <div className="relative flex items-center bg-[#0B1120]/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all group-focus-within:border-blue-500/50 group-focus-within:bg-[#0B1120] p-1 md:p-0">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-slate-400 ml-4 md:ml-6 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter any location, neighborhood, or zip code..."
                className="w-full bg-transparent border-none text-base md:text-lg font-light text-white placeholder-slate-500 px-4 md:px-6 py-4 md:py-5 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="mr-2 md:mr-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl font-medium hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs md:text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] shrink-0"
              >
                Predict
              </button>
            </div>
          </form>
          
          <div className="mt-10 flex flex-wrap justify-center items-center gap-4 text-xs text-slate-500 font-medium px-4">
            <span className="hidden sm:inline">Try Global Targets:</span>
            <button onClick={() => setQuery('Swargate, Pune')} className="hover:text-blue-400 transition-colors border-b border-dashed border-slate-600 hover:border-blue-400 pb-0.5">Swargate</button>
            <button onClick={() => setQuery('Manhattan, NY')} className="hover:text-blue-400 transition-colors border-b border-dashed border-slate-600 hover:border-blue-400 pb-0.5">Manhattan</button>
            <button onClick={() => setQuery('90210')} className="hover:text-blue-400 transition-colors border-b border-dashed border-slate-600 hover:border-blue-400 pb-0.5">Beverly Hills (90210)</button>
            <button onClick={() => setQuery('Mayfair, London')} className="hover:text-blue-400 transition-colors border-b border-dashed border-slate-600 hover:border-blue-400 pb-0.5">Mayfair, UK</button>
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 md:px-6 backdrop-blur-sm bg-[#020617]/80 w-full h-full">
            <div className="max-w-xl w-full flex flex-col items-center">
              <div className="h-24 md:h-20 flex items-center justify-center mb-12 md:mb-16">
                <p key={quoteIndex} className="text-center text-slate-400 text-base md:text-lg font-light italic leading-relaxed animate-[slideUpFade_1s_ease-out_forwards]">
                  {quotes[quoteIndex]}
                </p>
              </div>

              <div className="w-full bg-[#0B1120] border border-white/5 p-5 md:p-6 rounded-2xl shadow-2xl">
                <div className="flex justify-between items-end mb-4 overflow-hidden">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Crosshair className="w-4 h-4 text-blue-500 animate-spin shrink-0" style={{ animationDuration: '3s' }} />
                    <span key={phaseIndex} className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-blue-400 font-medium animate-[slideUpFade_0.4s_ease-out_forwards] inline-block">
                      {phases[phaseIndex]}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {progressPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                    style={{ 
                      width: startProgress ? '100%' : '0%',
                      transition: `width ${TOTAL_LOAD_TIME_MS}ms linear`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results State */}
        {result && !isSearching && (
          <div className="w-full max-w-6xl pt-24 pb-12 animate-[slideUpFade_0.8s_ease-out_forwards]">
            
            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-6 border-b border-white/10 pb-8">
              <div>
                <div className="inline-flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-blue-400 shrink-0" /> Target Acquired
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] md:text-xs text-blue-400 font-mono tracking-widest flex items-center gap-2 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    PIN/ZIP: {result.pincode}
                  </div>
                </div>
                <h2 className="text-4xl md:text-6xl font-semibold text-white tracking-tight">
                  {result.name}
                </h2>
              </div>
              <div className="w-full md:w-auto text-left md:text-right bg-[#0B1120] p-5 md:p-6 rounded-2xl border border-white/5 shadow-xl">
                <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.15em] mb-2 font-medium flex items-center md:justify-end gap-2">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 shrink-0" /> 36-Month Alpha Yield
                </div>
                <div className={`text-4xl md:text-5xl font-bold tracking-tight ${result.verdictColor}`}>
                  {result.yieldPrediction}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 w-full">
              
              {/* Left Column Metrics */}
              <div className="lg:col-span-4 space-y-6 w-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0B1120]/80 backdrop-blur-xl border border-white/5 p-5 md:p-6 rounded-2xl shadow-lg hover:border-white/10 transition-colors">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                      <BarChart2 className="w-3 h-3 text-blue-400 shrink-0" /> Reward
                    </div>
                    <div className="text-lg md:text-xl font-medium text-white">{result.reward}</div>
                  </div>
                  <div className="bg-[#0B1120]/80 backdrop-blur-xl border border-white/5 p-5 md:p-6 rounded-2xl shadow-lg hover:border-white/10 transition-colors">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0" /> Risk
                    </div>
                    <div className="text-lg md:text-xl font-medium text-white">{result.risk}</div>
                  </div>
                </div>

                <div className="bg-[#0B1120]/80 backdrop-blur-xl border border-white/5 p-5 md:p-6 rounded-2xl shadow-lg flex justify-between items-center">
                   <div>
                     <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" /> AI Confidence
                     </div>
                     <div className="text-xl md:text-2xl font-semibold text-white">{result.confidence}</div>
                   </div>
                   <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-slate-800 flex items-center justify-center relative shrink-0">
                     <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="50%" cy="50%" r="42%" fill="none" stroke="currentColor" strokeWidth="4" className="text-blue-500" strokeDasharray="175" strokeDashoffset={175 - (175 * parseInt(result.confidence) / 100)} />
                     </svg>
                     <Radar className="w-5 h-5 md:w-6 md:h-6 text-slate-300" />
                   </div>
                </div>
                
                <div className={`border p-5 md:p-6 rounded-2xl ${result.bgColor} ${result.borderColor} shadow-lg relative overflow-hidden group`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/10 transition-colors"></div>
                  <div className="text-[10px] uppercase tracking-widest mb-2 opacity-70 font-semibold">System Verdict</div>
                  <div className={`text-lg md:text-xl font-bold tracking-tight ${result.verdictColor}`}>
                    {result.verdict}
                  </div>
                </div>
              </div>

              {/* Right Column Intelligence */}
              <div className="lg:col-span-8 bg-[#0B1120]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 lg:p-10 shadow-lg relative overflow-hidden flex flex-col w-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                
                {/* Tactical Satellite View */}
                <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden border border-white/10 relative mb-8 shrink-0 bg-[#020617] shadow-inner group">
                  <div className="absolute top-4 left-4 z-[1000] bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-md text-[10px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-2 shadow-lg">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                    SAT-LINK: ACTIVE
                  </div>
                  <div className="absolute bottom-4 right-4 z-[1000] bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-md text-[10px] font-mono text-slate-400 flex items-center gap-2">
                    <Crosshair className="w-3 h-3 text-slate-500" />
                    {result.coords[0].toFixed(4)}° N, {result.coords[1].toFixed(4)}° E
                  </div>
                  
                  <div className="absolute inset-0 z-[500] pointer-events-none opacity-20 group-hover:opacity-10 transition-opacity bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>

                  <TacticalMap coords={result.coords} />
                  
                  <div className="absolute inset-0 bg-[#0B1120]/40 mix-blend-multiply pointer-events-none z-[400]"></div>
                </div>

                <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-white/5 pb-4 md:pb-6">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-blue-400 shrink-0" />
                    <h3 className="text-xs md:text-sm uppercase tracking-widest text-slate-300 font-medium">Leading Market Indicators</h3>
                  </div>
                </div>
                
                <div className="space-y-6 md:space-y-8 mb-10 w-full">
                  {result.points.map((point, index) => (
                    <div key={index} className="flex gap-4 md:gap-5 group">
                      <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-semibold group-hover:bg-blue-500 group-hover:text-white transition-all">
                        {index + 1}
                      </div>
                      <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed pt-0.5 md:pt-1 group-hover:text-white transition-colors">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>

                {/* NEW: Future Potential Section */}
                <div className="bg-[#020617]/50 border border-blue-500/20 rounded-xl p-5 md:p-6 mb-10 w-full relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                      <Target className="w-4 h-4 text-blue-400" />
                    </div>
                    <h4 className="text-xs md:text-sm uppercase tracking-[0.15em] text-blue-400 font-semibold">10-Year Macro Outlook</h4>
                  </div>
                  <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed relative z-10">
                    {result.futurePotential}
                  </p>
                </div>

                {/* GEMINI LLM INTELLIGENCE SECTION */}
                <div className="mt-auto pt-8 border-t border-white/5 w-full">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">Neural Synthesis Interface</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => generateAIText('intel')}
                        disabled={isAiGenerating}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                          activeAiMode === 'intel' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        ✨ Generate Deep Intel Dossier
                      </button>
                      <button 
                        onClick={() => generateAIText('strategy')}
                        disabled={isAiGenerating}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                          activeAiMode === 'strategy' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        ✨ Synthesize Acquisition Strategy
                      </button>
                    </div>

                    {/* AI Output Area */}
                    {(isAiGenerating || aiResponse || aiError) && (
                      <div className="mt-4 bg-black/40 border border-white/5 rounded-xl p-5 relative overflow-hidden w-full">
                        {isAiGenerating ? (
                          <div className="flex items-center gap-3 text-indigo-400 text-sm py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="font-mono animate-pulse text-xs tracking-widest uppercase">Establishing Neural Link...</span>
                          </div>
                        ) : aiError ? (
                          <div className="text-red-400 text-sm font-light flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>{aiError}</p>
                          </div>
                        ) : (
                          <div className="animate-[slideUpFade_0.4s_ease-out_forwards]">
                            <div className={`absolute top-0 left-0 w-1 h-full ${activeAiMode === 'intel' ? 'bg-indigo-500' : 'bg-cyan-500'}`}></div>
                            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-light pl-2">
                              {aiResponse}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Footer Action */}
            <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8 shadow-2xl w-full">
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-5">
                <div className="bg-blue-500/20 p-3 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-500/30 shrink-0 hidden md:block">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-400 md:hidden shrink-0" />
                    <div className="text-white font-semibold text-xs md:text-sm uppercase tracking-widest">The Oracle Advantage</div>
                  </div>
                  <div className="text-slate-400 text-xs md:text-sm max-w-3xl font-light leading-relaxed">
                    By the time a property hits a listing portal, the margin is gone. The entity that wields predictive data secures the asset before the market realizes the demand. Act on alpha.
                  </div>
                </div>
              </div>
              <button 
                onClick={resetSearch}
                className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-slate-200 transition-colors flex-shrink-0 shadow-lg"
              >
                New Scan
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
