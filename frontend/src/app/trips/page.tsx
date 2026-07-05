"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTripData } from "@/context/TripContext";
import Link from "next/link";

export default function MyTripsPage() {
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
    // Populate the global context with the saved trip data
    if (trip.trip_data) {
      setTripData(trip.trip_data);
      // Navigate to the itinerary page to view it
      router.push("/itinerary");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black tracking-tight text-on-surface flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl">travel_explore</span>
          My Saved Trips
        </h1>
        <Link href="/" className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Trip
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 rounded-3xl shadow-sm border border-outline-variant/30 text-center animate-fade-in">
          <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">flight_takeoff</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-3">No trips saved yet</h2>
          <p className="text-on-surface-variant max-w-md mx-auto mb-8 text-sm">
            You haven't saved any itineraries to your dashboard. Start planning your next adventure with Wandr AI!
          </p>
          <Link href="/" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm">
            Plan a Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {trips.map((trip) => (
            <div 
              key={trip.id} 
              className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group flex flex-col"
              onClick={() => loadTrip(trip)}
            >
              {/* Card Header (Image Placeholder or Gradient) */}
              <div className="h-32 bg-gradient-to-br from-primary-container to-secondary-container relative p-5 flex items-end">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                <div className="relative z-10 w-full flex justify-between items-end">
                  <h3 className="text-xl font-black text-on-primary-container leading-tight">
                    {trip.destination}
                  </h3>
                  <div className="bg-surface/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-on-surface shadow-sm">
                    {trip.duration || Math.max(1, Math.ceil((new Date(trip.arrival_date).getTime() - new Date(trip.departure_date).getTime()) / (1000 * 3600 * 24)))} Days
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
                    <span>{trip.origin}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    <span>{trip.adults} Travelers</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container py-1.5 px-3 rounded-lg w-fit">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {new Date(trip.departure_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(trip.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                <div className="mt-auto pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">₹{trip.budget.toLocaleString()}</span>
                  <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Open Trip <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
