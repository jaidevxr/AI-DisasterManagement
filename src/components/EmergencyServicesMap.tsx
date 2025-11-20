import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
// @ts-ignore
import 'leaflet-routing-machine';
import { EmergencyService, Location } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { searchLocation } from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Hospital, Shield, Flame, Navigation, X, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmergencyServicesMapProps {
  onFacilityClick?: (facility: EmergencyService) => void;
}

const EmergencyServicesMap: React.FC<EmergencyServicesMapProps> = ({ onFacilityClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routingControlRef = useRef<any>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["hospital", "police", "fire_station"]);
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [showingRoute, setShowingRoute] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const { toast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for city suggestions
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocation(searchQuery);
        setSearchResults(results.slice(0, 5));
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setShowDropdown(false);
      }
      setIsSearching(false);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectLocation = (location: Location) => {
    setUserLocation([location.lat, location.lng]);
    fetchNearbyServices(location.lat, location.lng);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const getUserLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation. Using default location.",
        variant: "destructive",
      });
      const defaultLoc: [number, number] = [28.6139, 77.2090];
      setUserLocation(defaultLoc);
      fetchNearbyServices(defaultLoc[0], defaultLoc[1]);
      return;
    }

    console.log("🔍 Requesting geolocation permission...");
    
    // Request with high accuracy and proper timeout
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ [EmergencyServicesMap] RAW Location from browser:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString()
        });
        const { latitude, longitude } = position.coords;
        const location: [number, number] = [latitude, longitude];
        setUserLocation(location);
        
        toast({
          title: "Location Detected",
          description: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}, Accuracy: ${position.coords.accuracy.toFixed(0)}m`,
          duration: 10000,
        });
        
        fetchNearbyServices(latitude, longitude);
      },
      (error) => {
        console.error("❌ Geolocation error:", error.code, error.message);
        
        let errorMessage = "Unable to get your location. ";
        let actionMessage = "";
        
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Location permission denied. ";
            actionMessage = "Please click the location icon in your browser's address bar and allow location access, then try again.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Location information unavailable. ";
            actionMessage = "Please check your device's location settings.";
            break;
          case 3: // TIMEOUT
            errorMessage = "Location request timed out. ";
            actionMessage = "Please try again.";
            break;
          default:
            errorMessage = "Unknown error occurred.";
        }
        
        toast({
          title: "Location Error",
          description: errorMessage + actionMessage + " Using Delhi as default.",
          variant: "destructive",
          duration: 8000,
        });
        
        // Default to Delhi
        const defaultLoc: [number, number] = [28.6139, 77.2090];
        setUserLocation(defaultLoc);
        fetchNearbyServices(defaultLoc[0], defaultLoc[1]);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const showRoute = (service: EmergencyService) => {
    if (!mapInstanceRef.current || !userLocation) {
      toast({
        title: "Cannot Show Route",
        description: "User location not available",
        variant: "destructive",
      });
      return;
    }

    console.log("🗺️ Showing route to:", service.name);

    // Remove existing routing control
    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Create routing control
    const routingControl = (L as any).Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(service.lat, service.lng)
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 5, opacity: 0.8 }]
      },
      createMarker: () => null, // Don't create default markers
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    }).addTo(mapInstanceRef.current);

    routingControlRef.current = routingControl;
    setSelectedService(service);
    setShowingRoute(true);

    toast({
      title: "Route Calculated",
      description: `Showing directions to ${service.name}`,
    });
  };

  const clearRoute = () => {
    if (routingControlRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    setSelectedService(null);
    setShowingRoute(false);
  };

  const fetchNearbyServices = async (lat: number, lng: number) => {
    console.log(`Fetching services for location: ${lat}, ${lng}`);
    console.log(`Selected types: ${selectedTypes.join(',')}`);
    
    try {
      const { data, error } = await supabase.functions.invoke("nearby", {
        body: { lat, lng, types: selectedTypes.join(",") },
      });

      console.log("Supabase response data:", data);
      console.log("Supabase response error:", error);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (!data || !data.services) {
        console.error("No services in response:", data);
        setServices([]);
        toast({
          title: "No Services",
          description: "No emergency services found in this area",
        });
        return;
      }
      
      console.log(`Setting ${data.services.length} services in state`);
      setServices(data.services);
      
      toast({
        title: "Services Loaded",
        description: `Found ${data.services.length} nearby emergency services`,
      });
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load emergency services",
        variant: "destructive",
      });
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "hospital":
        return <Hospital className="w-4 h-4" />;
      case "police":
        return <Shield className="w-4 h-4" />;
      case "fire_station":
        return <Flame className="w-4 h-4" />;
      default:
        return <Hospital className="w-4 h-4" />;
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
    mapInstanceRef.current = map;

    const getTileUrl = () => {
      if (isDarkMode) {
        return 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
      }
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    };

    const tileLayer = L.tileLayer(getTileUrl(), {
      attribution: isDarkMode ? '© CartoDB © OpenStreetMap' : '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Update map tiles when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const getTileUrl = () => {
      if (isDarkMode) {
        return 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
      }
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    };

    const newTileLayer = L.tileLayer(getTileUrl(), {
      attribution: isDarkMode ? '© CartoDB © OpenStreetMap' : '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [isDarkMode]);

  useEffect(() => {
    console.log('🗺️ [EmergencyServicesMap] Component mounted, requesting location...');
    getUserLocation();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (userLocation) {
      fetchNearbyServices(userLocation[0], userLocation[1]);
    }
  }, [selectedTypes]);

  // Update markers when services or location changes
  useEffect(() => {
    if (!mapInstanceRef.current) {
      console.log("Map not initialized yet");
      return;
    }

    console.log(`Updating map with ${services.length} services`);

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Center map on user location if available
    if (userLocation) {
      console.log(`Centering map on user location: ${userLocation}`);
      mapInstanceRef.current.setView(userLocation, 13);
      
      // Add user location marker
      const userMarker = L.marker(userLocation)
        .bindPopup('<strong>Your Location</strong>')
        .addTo(mapInstanceRef.current);
      markersRef.current.push(userMarker);
    }

    // Add service markers
    console.log("Adding service markers...");
    services.forEach((service, index) => {
      console.log(`Adding marker ${index + 1}/${services.length}:`, service.name, service.type);
      
      const marker = L.marker([service.lat, service.lng])
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong>${service.name}</strong><br/>
            <span style="font-size: 12px; color: #666;">
              Type: ${service.type}<br/>
              Distance: ${service.distance.toFixed(2)} km
              ${service.address ? `<br/>Address: ${service.address}` : ''}
            </span>
          </div>
        `)
        .addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });
    
    console.log(`Added ${markersRef.current.length} total markers to map`);
  }, [services, userLocation]);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-96 bg-card border-r p-4 overflow-y-auto">
        {/* City Search */}
        <div className="mb-4 space-y-2">
          <div ref={searchContainerRef} className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search city for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass border-border/30 focus:border-primary/50"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
            
            {/* Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectLocation(result)}
                    className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors border-b border-border last:border-0"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery.trim() && !isSearching && searchResults.length === 0 && showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 p-3">
                <p className="text-sm text-muted-foreground text-center">No cities found</p>
              </div>
            )}
          </div>

          <Button
            onClick={getUserLocation}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Use My Current Location
              </>
            )}
          </Button>
        </div>

        {/* Service Type Filters */}
        <div className="mb-4 space-y-2">
          <p className="font-semibold text-sm">Filter by Type:</p>
          {[
            { id: "hospital", label: "Hospitals", icon: <Hospital className="w-4 h-4" /> },
            { id: "police", label: "Police", icon: <Shield className="w-4 h-4" /> },
            { id: "fire_station", label: "Fire Stations", icon: <Flame className="w-4 h-4" /> },
          ].map(({ id, label, icon }) => (
            <label key={id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTypes([...selectedTypes, id]);
                  } else {
                    setSelectedTypes(selectedTypes.filter((t) => t !== id));
                  }
                }}
                className="rounded"
              />
              {icon}
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>

        {/* Services List */}
        <div className="space-y-2">
          <p className="font-semibold text-sm mb-2">
            Nearby Services ({services.length})
          </p>
          {loading && (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading services...</p>
            </div>
          )}
          {!loading && services.length === 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">No services found</p>
            </div>
          )}
          {!loading && services.map((service) => (
            <Card 
              key={service.id} 
              className={`p-3 hover:bg-accent cursor-pointer transition-all ${
                selectedService?.id === service.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView([service.lat, service.lng], 15);
                }
              }}
            >
              <div className="flex items-start gap-2">
                {getServiceIcon(service.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {service.distance.toFixed(2)} km away
                  </p>
                  {service.address && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {service.address}
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      showRoute(service);
                    }}
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="h-full w-full" />
        
        {/* Route Info Panel */}
        {showingRoute && selectedService && (
          <div className="absolute top-4 right-4 bg-card border rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm">Navigating to</h3>
                <p className="text-sm text-foreground mt-1">{selectedService.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedService.distance.toFixed(2)} km away
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRoute}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Follow the blue route on the map for turn-by-turn directions
            </p>
          </div>
        )}
        
        {/* Location Status */}
        {userLocation && (
          <div className="absolute bottom-4 left-4 bg-card border rounded-lg shadow-lg px-4 py-3 space-y-2 min-w-64">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">📍 Detected Location:</p>
              <Button
                size="sm"
                variant="outline"
                onClick={getUserLocation}
                className="h-6 text-xs"
                disabled={loading}
              >
                {loading ? '...' : 'Refresh'}
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono text-muted-foreground">
                Lat: {userLocation[0].toFixed(6)}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                Lng: {userLocation[1].toFixed(6)}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground">
              If this is incorrect, check browser location permissions or use a different device
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyServicesMap;