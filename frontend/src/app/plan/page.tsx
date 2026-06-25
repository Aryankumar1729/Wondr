"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Wallet, Users, Compass, Settings, Loader2, Sparkles, Navigation, Clock, Sun, Map as MapIcon, Coffee, ListFilter, PlaneTakeoff, Building2 } from "lucide-react";

export default function PlanPage() {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);
  const [logistics, setLogistics] = useState<any>(null);

  const [formData, setFormData] = useState({
    origin: "Delhi",
    destination: "Jaipur",
    start_date: "2026-10-01",
    end_date: "2026-10-05",
    budget: 50000,
    travel_style: "moderate",
    num_travelers: 2,
    preferences: "heritage, food"
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setItinerary(null);
    setLogistics(null);
    try {
      const payload = {
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: Number(formData.budget),
        travel_style: formData.travel_style,
        num_travelers: Number(formData.num_travelers),
        preferences: formData.preferences.split(",").map((s: string) => s.trim())
      };
      
      const [itineraryRes, logisticsRes] = await Promise.all([
        fetch("http://localhost:8000/api/itinerary/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }),
        fetch("http://localhost:8000/api/logistics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: formData.origin,
            destination: formData.destination,
            date: formData.start_date,
            adults: Number(formData.num_travelers)
          })
        })
      ]);

      if (itineraryRes.ok) {
        setItinerary(await itineraryRes.json());
      } else {
        alert("Error generating itinerary.");
      }

      if (logisticsRes.ok) {
        setLogistics(await logisticsRes.json());
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend. Make sure it is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "food": return <Coffee className="w-4 h-4 text-orange-400" />;
      case "sightseeing": return <MapIcon className="w-4 h-4 text-teal-400" />;
      case "adventure": return <Compass className="w-4 h-4 text-rose-400" />;
      case "transit": return <Navigation className="w-4 h-4 text-blue-400" />;
      case "rest": return <Clock className="w-4 h-4 text-indigo-400" />;
      default: return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-4"
        >
          <div className="glass-strong p-8 rounded-3xl h-fit sticky top-28 shadow-2xl shadow-black/50 border border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber" />
              </div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber to-amber-light">
                Craft Your Journey
              </h2>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-400" /> Origin
                  </label>
                  <input 
                    name="origin" 
                    value={formData.origin} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-[#0a0e1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-400" /> Destination
                  </label>
                  <input 
                    name="destination" 
                    value={formData.destination} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-[#0a0e1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-400" /> Start
                  </label>
                  <input 
                    type="date" 
                    name="start_date" 
                    value={formData.start_date} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-[#0a0e1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber/50 transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-90"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-400" /> End
                  </label>
                  <input 
                    type="date" 
                    name="end_date" 
                    value={formData.end_date} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-[#0a0e1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber/50 transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-90"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Wallet className="w-4 h-4 text-gray-400" /> Budget (₹)
                  </label>
                  <input 
                    type="number" 
                    name="budget" 
                    value={formData.budget} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-[#0a0e1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Users className="w-4 h-4 text-gray-400" /> Travelers
                  </label>
                  <input 
                    type="number" 
                    name="num_travelers" 
                    value={formData.num_travelers} 
                    onChange={handleChange} 
                    min={1} 
                    required 
                    className="w-full bg-[#0a0e1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Compass className="w-4 h-4 text-gray-400" /> Travel Style
                </label>
                <div className="relative">
                  <select 
                    name="travel_style" 
                    value={formData.travel_style} 
                    onChange={handleChange} 
                    className="w-full appearance-none bg-[#0a0e1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber/50 transition-all"
                  >
                    <option value="relaxed" className="bg-[#0f1629]">Relaxed - Slow paced</option>
                    <option value="moderate" className="bg-[#0f1629]">Moderate - Balanced</option>
                    <option value="packed" className="bg-[#0f1629]">Packed - See it all</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <ListFilter className="w-4 h-4 text-gray-400" /> Specific Preferences
                </label>
                <input 
                  name="preferences" 
                  value={formData.preferences} 
                  onChange={handleChange} 
                  placeholder="e.g. street food, old temples, no hiking" 
                  className="w-full bg-[#0a0e1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber/50 transition-all"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading} 
                className="w-full mt-4 bg-gradient-to-r from-amber to-amber-light text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Itinerary
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        <div className="lg:col-span-8 min-h-[600px]">
          <AnimatePresence mode="wait">
            {!loading && !itinerary && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-3xl p-12 text-center border border-white/5 h-full flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div className="absolute w-[500px] h-[500px] bg-amber/5 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="w-20 h-20 bg-gradient-to-tr from-amber/20 to-teal/20 rounded-full flex items-center justify-center mb-6 relative z-10">
                  <MapPin className="w-10 h-10 text-amber" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Your Canvas Awaits</h3>
                <p className="text-gray-400 max-w-md relative z-10">
                  Set your parameters on the left. Wandr will analyze weather, travel times, and local knowledge to craft your perfect journey.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-3xl p-12 text-center border border-white/5 h-full flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div className="absolute w-[500px] h-[500px] bg-teal/10 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <Loader2 className="w-16 h-16 text-teal animate-spin mb-6 relative z-10" />
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 mb-3 relative z-10">
                  Consulting the Oracle...
                </h3>
                <p className="text-gray-400 relative z-10 flex flex-col gap-2">
                  <span className="animate-pulse">Checking local weather patterns...</span>
                  <span className="animate-pulse delay-100">Calculating transit times...</span>
                  <span className="animate-pulse delay-200">Finding the best local spots...</span>
                  <span className="animate-pulse delay-300">Searching flights & hotels...</span>
                </p>
              </motion.div>
            )}

            {itinerary && !loading && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="glass-strong p-10 rounded-3xl border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber/20 rounded-full blur-[80px] -mr-20 -mt-20" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-xs font-medium text-amber mb-4 uppercase tracking-wider">
                        {itinerary.num_days} Days • {itinerary.travel_style}
                      </div>
                      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                        {itinerary.destination}
                      </h1>
                      <p className="text-lg text-gray-400 flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> 
                        {itinerary.start_date} to {itinerary.end_date}
                      </p>
                    </div>
                  </div>

                  {itinerary.budget && (
                    <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Stay", value: itinerary.budget.accommodation, icon: "🏨" },
                        { label: "Food", value: itinerary.budget.food, icon: "🍛" },
                        { label: "Transit", value: itinerary.budget.transport, icon: "🚖" },
                        { label: "Activities", value: itinerary.budget.activities, icon: "🎟️" },
                      ].map((b, i) => (
                        <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="text-2xl mb-2">{b.icon}</div>
                          <p className="text-sm text-gray-400 mb-1">{b.label}</p>
                          <p className="text-xl font-bold text-white">₹{b.value}</p>
                        </div>
                      ))}
                      <div className="col-span-2 md:col-span-4 mt-2 bg-gradient-to-r from-amber/20 to-transparent p-5 rounded-2xl border border-amber/20 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-amber-light font-medium uppercase tracking-wider mb-1">Total Estimated Budget</p>
                          <p className="text-3xl font-extrabold text-amber">₹{itinerary.budget.total}</p>
                        </div>
                        <Wallet className="w-10 h-10 text-amber opacity-50" />
                      </div>
                    </div>
                  )}
                </div>

                {logistics && (logistics.flights.length > 0 || logistics.hotels.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Flights */}
                    {logistics.flights.length > 0 && (
                      <div className="glass p-6 rounded-3xl border border-white/5">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                          <PlaneTakeoff className="text-blue-400" /> Flight Options
                        </h3>
                        <div className="space-y-3">
                          {logistics.flights.map((f: any, i: number) => (
                            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-blue-400/30 transition-all flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-white">{f.airline}</p>
                                <p className="text-xs text-gray-400">{f.stops === 0 ? "Direct" : `${f.stops} Stop(s)`}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-emerald-400">{f.price}</p>
                                <p className="text-xs text-gray-400">{new Date(f.departure).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(f.arrival).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Hotels */}
                    {logistics.hotels.length > 0 && (
                      <div className="glass p-6 rounded-3xl border border-white/5">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                          <Building2 className="text-teal-400" /> Hotel Options
                        </h3>
                        <div className="space-y-3">
                          {logistics.hotels.map((h: any, i: number) => (
                            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-teal-400/30 transition-all flex gap-4 items-center">
                              {h.image_url ? (
                                <img src={h.image_url} alt={h.name} className="w-16 h-16 object-cover rounded-xl border border-white/10" />
                              ) : (
                                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                  <Building2 className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{h.name}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {h.chain ? `Price: ₹${h.chain}` : "Price info unavailable"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-6">
                  {itinerary.days.map((day: any, dIdx: number) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dIdx * 0.1 }}
                      key={day.day_number} 
                      className="glass rounded-3xl border border-white/5 overflow-hidden"
                    >
                      <div className="bg-white/[0.02] p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber to-rose-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-amber/20">
                            {day.day_number}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{day.title}</h3>
                            <p className="text-sm text-gray-400">{day.date}</p>
                          </div>
                        </div>
                        {day.weather_summary && (
                          <div className="flex items-center gap-2 bg-blue-500/10 text-blue-300 px-4 py-2 rounded-xl border border-blue-500/20 text-sm">
                            <Sun className="w-4 h-4" /> {day.weather_summary}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 space-y-4">
                        {day.activities.map((act: any, idx: number) => (
                          <div key={idx} className="group relative pl-8 pb-4">
                            {idx !== day.activities.length - 1 && (
                              <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-white/10 group-hover:bg-amber/50 transition-colors" />
                            )}
                            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white/10 border-2 border-[#111827] flex items-center justify-center z-10 group-hover:bg-amber group-hover:border-amber/30 transition-all">
                              <div className="w-2 h-2 rounded-full bg-gray-400 group-hover:bg-black transition-colors" />
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
                              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <span className="inline-flex items-center gap-1.5 text-amber text-sm font-bold bg-amber/10 px-3 py-1 rounded-lg">
                                  <Clock className="w-3.5 h-3.5" /> {act.time_slot}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-300 bg-black/40 px-3 py-1 rounded-lg border border-white/5 uppercase tracking-wider">
                                  {getCategoryIcon(act.category)} {act.category}
                                </span>
                              </div>
                              <h4 className="text-lg font-bold text-white mb-2">{act.title}</h4>
                              
                              <p className="text-gray-400 text-sm leading-relaxed mb-4">{act.description}</p>
                              
                              <div className="flex flex-wrap gap-3">
                                {act.place_name && (
                                  <div className="flex items-center gap-1.5 text-xs text-teal-400 bg-teal-400/10 px-3 py-1.5 rounded-lg border border-teal-400/20">
                                    <MapPin className="w-3.5 h-3.5" /> {act.place_name}
                                  </div>
                                )}
                                {act.travel_time_from_prev && (
                                  <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                                    <Navigation className="w-3.5 h-3.5" /> {act.travel_time_from_prev}
                                  </div>
                                )}
                                {act.estimated_cost && (
                                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                    <Wallet className="w-3.5 h-3.5" /> ₹{act.estimated_cost}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
