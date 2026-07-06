"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const PILLS = [
  { id: "restaurant", icon: "restaurant", label: "Restaurant" },
  { id: "cafe", icon: "local_cafe", label: "Cafe" },
  { id: "bar", icon: "wine_bar", label: "Bar" },
  { id: "hotel", icon: "bed", label: "Hotel" },
  { id: "sights", icon: "photo_camera", label: "Sights" },
  { id: "museum", icon: "museum", label: "Museum" },
  { id: "nature", icon: "park", label: "Nature" },
  { id: "activity", icon: "local_activity", label: "Activity" }
];

// Helper to generate the exact map pin matching the screenshot
const getCustomIcon = (iconName: string) => {
  return new L.DivIcon({
    html: `
      <div style="
        background-color: #EF4444; 
        color: white;
        width: 28px; 
        height: 28px; 
        border-radius: 50%; 
        border: 2px solid white; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span class="material-symbols-outlined" style="font-size: 16px;">${iconName}</span>
      </div>
    `,
    className: "custom-pin",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

// Component to dynamically change map view
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

export default function MapComponent({ lat, lng, destination, aiMarkers = [] }: { lat: number; lng: number; destination: string; aiMarkers?: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [explorePlaces, setExplorePlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCategory) {
      setExplorePlaces([]);
      return;
    }

    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/explore?lat=${lat}&lng=${lng}&category=${selectedCategory}&radius=3000`);
        const data = await res.json();
        if (data.status === "success") {
          setExplorePlaces(data.data);
        } else {
          setExplorePlaces([]);
        }
      } catch (e) {
        console.error("Explore fetch error:", e);
        setExplorePlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [selectedCategory, lat, lng]);

  const activePill = PILLS.find(p => p.id === selectedCategory);
  const activeIcon = activePill ? activePill.icon : "location_on";
  const pinIcon = getCustomIcon(activeIcon);

  // Helper to generate dynamic photo icons for AI markers
  const getPhotoIcon = (photoUrl?: string) => {
    const defaultIcon = '<span class="material-symbols-outlined" style="font-size: 20px; color: #666;">landscape</span>';
    const content = photoUrl 
      ? `<img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
      : defaultIcon;

    return new L.DivIcon({
      html: `
        <div style="
          background-color: white; 
          width: 36px; 
          height: 36px; 
          border-radius: 50%; 
          border: 2px solid white; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        ">
          ${content}
        </div>
      `,
      className: "custom-pin",
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* Floating Map Filters (The category pills!) */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-200 px-3 py-2 flex items-center gap-1 z-[1000]">
        {PILLS.map((pill) => (
          <button 
            key={pill.id} 
            onClick={() => setSelectedCategory(selectedCategory === pill.id ? null : pill.id)}
            title={pill.label}
            className={`transition-colors w-9 h-9 flex items-center justify-center rounded-full ${
              selectedCategory === pill.id ? "bg-[#EF4444] text-white" : "bg-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{pill.icon}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-[#1C1C1E] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg z-[1000] flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
          Searching {selectedCategory}...
        </div>
      )}

      <MapContainer center={[lat, lng]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={[lat, lng]} />
        
        {/* Main destination marker */}
        <Marker position={[lat, lng]}>
          <Popup>
            <strong>{destination}</strong>
          </Popup>
        </Marker>

        {/* Explored places markers */}
        {explorePlaces.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            icon={pinIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="block mb-1">{place.name}</strong>
                <span className="text-xs text-gray-500">{place.type}</span>
                {place.address && <span className="block mt-1 text-xs">{place.address}</span>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* AI Itinerary Markers */}
        {aiMarkers.map((marker, i) => (
          <Marker 
            key={`ai-${i}`} 
            position={[marker.lat, marker.lng]}
            icon={getPhotoIcon(marker.photo)}
          >
            <Popup>
              <div className="text-sm min-w-[120px]">
                {marker.photo && (
                  <img src={marker.photo} alt={marker.title} className="w-full h-24 object-cover rounded mb-2" />
                )}
                <strong className="block mb-1 text-gray-900">{marker.title}</strong>
                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{marker.type || "AI Suggestion"}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
