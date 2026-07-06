"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTripData } from "@/context/TripContext";
import Link from "next/link";
import CurrencyWidget from "@/components/CurrencyWidget";
import HolidaysWidget from "@/components/HolidaysWidget";

export default function MyTripsDashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setTripData } = useTripData();

  useEffect(() => {
    async function fetchTrips() {
      try {
        const res = await fetch("http://localhost:8000/api/trips/");
        if (res.ok) {
          const data = await res.json();
          setTrips(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching trips:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  const loadTrip = (trip: any) => {
    if (trip.trip_data) {
      setTripData(trip.trip_data);
      router.push("/itinerary");
    }
  };

  const colors = [
    "from-[#FF8F71] to-[#D5A233]", // Orange to Gold
    "from-[#F66BAF] to-[#7C365C]", // Pink to Dark Purple
    "from-[#4CA1AF] to-[#2C3E50]", // Cyan to Navy
    "from-[#56CCF2] to-[#2F80ED]", // Light Blue to Deep Blue
  ];

  // Dynamic calculations
  const totalTrips = trips.length;
  
  const totalPlaces = trips.reduce((acc, trip) => {
    const days = trip.trip_data?.itinerary?.days || [];
    const activitiesCount = days.reduce((dAcc: number, day: any) => dAcc + (day.activities?.length || 0), 0);
    return acc + activitiesCount;
  }, 0);

  const totalDays = trips.reduce((acc, trip) => {
    const depDate = new Date(trip.departure_date);
    const arrDate = new Date(trip.arrival_date);
    const daysDiff = Math.max(1, Math.ceil((arrDate.getTime() - depDate.getTime()) / (1000 * 3600 * 24)));
    return acc + daysDiff;
  }, 0);

  const estimatedKm = totalPlaces * 24;

  return (
    <div className="flex flex-col gap-8 text-[#111827] pt-24 px-8 pb-12 max-w-[1400px] mx-auto">
      {/* Top Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#1C1C1E] text-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-40">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-bold tracking-tight">{totalTrips}</h2>
              <span className="text-gray-400 font-medium">trips planned</span>
            </div>
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-[#1C1C1E] z-10 flex items-center justify-center text-[10px]">📍</div>
            <div className="w-8 h-8 rounded-full bg-white border-2 border-[#1C1C1E] z-0 flex items-center justify-center text-[10px]">🌍</div>
          </div>
        </div>
        
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden">
          <div>
            <h2 className="text-5xl font-bold tracking-tight text-gray-900">{totalPlaces}</h2>
            <span className="text-gray-500 font-medium text-sm mt-1 block">places mapped</span>
          </div>
          <svg className="absolute bottom-4 right-4 w-16 h-8 text-gray-400" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M0 30 L20 35 L40 20 L60 25 L80 10 L100 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-bold tracking-tight text-gray-900">{totalDays}</h2>
              <span className="text-gray-500 font-medium text-lg">days</span>
            </div>
            <span className="text-gray-500 font-medium text-sm mt-1 block">across all trips</span>
          </div>
          <svg className="absolute bottom-4 right-4 w-20 h-8 text-gray-400" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M0 35 L30 30 L60 25 L80 15 L100 10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-bold tracking-tight text-gray-900">{estimatedKm}</h2>
              <span className="text-gray-500 font-medium text-lg">km</span>
            </div>
            <span className="text-gray-500 font-medium text-sm mt-1 block w-2/3 leading-tight">≈ {(estimatedKm / 40075).toFixed(4)}× around the equator</span>
          </div>
          <div className="absolute bottom-4 right-6 w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-400 transform -rotate-45"></div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex gap-10">
        
        {/* Left Side: My Trips List */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Trips</h1>
            
            <div className="flex items-center gap-6">
              <div className="flex bg-[#f9f9f9] border border-gray-200 rounded-full p-1 shadow-sm">
                <button className="px-5 py-1.5 rounded-full bg-white text-gray-900 font-semibold text-sm shadow-sm">Planned</button>
                <button className="px-5 py-1.5 rounded-full text-gray-500 hover:text-gray-900 font-semibold text-sm transition-colors">Archived</button>
                <button className="px-5 py-1.5 rounded-full text-gray-500 hover:text-gray-900 font-semibold text-sm transition-colors">Completed</button>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <span className="material-symbols-outlined cursor-pointer hover:text-gray-900 transition-colors text-[20px]">calendar_today</span>
                <span className="material-symbols-outlined cursor-pointer text-gray-900 text-[20px]">format_list_bulleted</span>
              </div>
            </div>
          </div>

          {/* Grid of Trips */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Real Trips from DB */}
            {trips.map((trip, idx) => {
              const bgGradient = colors[idx % colors.length];
              const depDate = new Date(trip.departure_date);
              const arrDate = new Date(trip.arrival_date);
              const daysDiff = Math.max(1, Math.ceil((arrDate.getTime() - depDate.getTime()) / (1000 * 3600 * 24)));
              
              // Calculate days until trip
              const daysUntil = Math.ceil((depDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              const inDaysText = daysUntil > 0 ? `IN ${daysUntil} DAYS` : daysUntil === 0 ? "TODAY" : "PAST TRIP";

              return (
                <div 
                  key={trip.id} 
                  onClick={() => loadTrip(trip)}
                  className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group flex flex-col h-72"
                >
                  <div className={`flex-1 bg-gradient-to-br ${bgGradient} p-5 relative flex items-end`}>
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-300"></div>
                      <span className="text-[10px] font-bold text-white tracking-widest">{inDaysText}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white leading-tight tracking-tight shadow-sm z-10 w-3/4">
                      {trip.destination}
                    </h3>
                  </div>
                  
                  <div className="h-32 p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-500 border-b border-gray-100 pb-3">
                      <span>{depDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="material-symbols-outlined text-[14px] text-gray-300">arrow_forward</span>
                      <span>{arrDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between text-center pt-2">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{daysDiff}</p>
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Days</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">1</p>
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Places</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{trip.adults}</p>
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Buddy</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty "New Trip" Card */}
            <Link href="/" className="rounded-[24px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-72 hover:border-gray-400 transition-colors group cursor-pointer bg-transparent">
              <div className="w-12 h-12 bg-[#1C1C1E] rounded-full flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">add</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">New Trip</h3>
              <p className="text-sm text-gray-500 font-medium">Plan a new trip from scratch</p>
            </Link>

          </div>
        </div>

        {/* Right Side: Widgets Column */}
        <div className="w-80 flex flex-col gap-6">
          
          <CurrencyWidget />

          <HolidaysWidget 
            destination={trips[0]?.destination} 
            startDate={trips[0]?.departure_date} 
            endDate={trips[0]?.arrival_date} 
          />

          {/* Timezones Widget */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 text-gray-500 text-xs font-bold tracking-widest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                TIMEZONES
              </div>
              <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-gray-900">add</span>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">C</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Calcutta</p>
                    <p className="text-[10px] font-semibold text-gray-400">GMT+5:30</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">16:28</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">L</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">London</p>
                    <p className="text-[10px] font-semibold text-gray-400">GMT+1</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">11:58</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">T</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Tokyo</p>
                    <p className="text-[10px] font-semibold text-gray-400">GMT+9</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">19:58</p>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Floating New Trip Button */}
      <div className="fixed bottom-8 right-32 z-50">
        <Link href="/" className="bg-[#1C1C1E] text-white px-6 py-4 rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-black transition-colors hover:scale-105 active:scale-95 duration-200">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Trip
        </Link>
      </div>

    </div>
  );
}
