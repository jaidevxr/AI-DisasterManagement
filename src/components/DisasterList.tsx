import React, { useState } from 'react';
import { AlertTriangle, MapPin, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DisasterEvent } from '@/types';

interface DisasterListProps {
  disasters: DisasterEvent[];
  onDisasterClick: (disaster: DisasterEvent) => void;
  loading?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

const DisasterList: React.FC<DisasterListProps> = ({ disasters, onDisasterClick, loading, userLocation }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Calculate distance from user location
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Separate disasters into nearby (within 500km) and India-wide
  const nearbyDisasters = userLocation 
    ? disasters.filter(d => {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, d.location.lat, d.location.lng);
        return distance <= 500;
      })
    : [];

  const indiaWideDisasters = disasters;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (disasters.length === 0) {
    return (
      <Card className="glass p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-success mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">No Active Disasters</h3>
        <p className="text-muted-foreground">
          Great news! There are currently no major disasters reported in your area.
        </p>
      </Card>
    );
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getDisasterIcon = (type: string, isPrediction: boolean = false) => {
    if (isPrediction) {
      return '🤖';
    }
    switch (type) {
      case 'earthquake':
        return '⚡';
      case 'flood':
        return '🌊';
      case 'cyclone':
        return '🌀';
      case 'fire':
      case 'wildfire':
        return '🔥';
      case 'landslide':
        return '⛰️';
      case 'drought':
        return '🌵';
      case 'tsunami':
        return '🌊';
      default:
        return '⚠️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/5';
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      default:
        return 'severity-low';
    }
  };

  const groupedDisasters = disasters.reduce((acc, disaster) => {
    if (!acc[disaster.type]) {
      acc[disaster.type] = [];
    }
    acc[disaster.type].push(disaster);
    return acc;
  }, {} as Record<string, DisasterEvent[]>);

  const renderDisasterGroup = (disastersList: DisasterEvent[], title: string) => {
    const grouped = disastersList.reduce((acc, disaster) => {
      if (!acc[disaster.type]) {
        acc[disaster.type] = [];
      }
      acc[disaster.type].push(disaster);
      return acc;
    }, {} as Record<string, DisasterEvent[]>);

    if (disastersList.length === 0) {
      return (
        <Card className="glass p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-success mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Disasters in This Area</h3>
          <p className="text-muted-foreground">No disasters reported in this region.</p>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {Object.entries(grouped).map(([type, typeDisasters]) => (
        <div key={type} className="space-y-3">
          <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
            <span className="text-2xl">{getDisasterIcon(type)}</span>
            {type.replace('_', ' ')}s ({typeDisasters.length})
          </h3>
          
          <div className="space-y-3">
            {typeDisasters.map((disaster) => {
              const isExpanded = expandedItems.has(disaster.id);
              const distance = userLocation 
                ? calculateDistance(userLocation.lat, userLocation.lng, disaster.location.lat, disaster.location.lng)
                : null;
              
              return (
                <Card 
                  key={disaster.id} 
                  className={`glass-strong p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated cursor-pointer border-2 ${getSeverityColor(disaster.severity)} backdrop-blur-lg`}
                >
                  <div className="space-y-4">
                     {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl text-2xl ${getSeverityColor(disaster.severity)}`}>
                          {getDisasterIcon(disaster.type, disaster.isPrediction)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-semibold text-base">{disaster.title}</h4>
                            {disaster.isPrediction && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 text-xs">
                                🤖 AI Prediction
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {disaster.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                            {disaster.isPrediction ? (
                              <>
                                {disaster.timeframeDays !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Expected in {disaster.timeframeDays} days</span>
                                  </div>
                                )}
                                {disaster.probability !== undefined && (
                                  <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30">
                                    {(disaster.probability * 100).toFixed(0)}% probability
                                  </Badge>
                                )}
                                {disaster.confidence !== undefined && (
                                  <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30">
                                    {(disaster.confidence * 100).toFixed(0)}% confidence
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{disaster.time ? new Date(disaster.time).toLocaleString('en-IN') : disaster.timestamp ? new Date(disaster.timestamp).toLocaleString('en-IN') : 'Unknown'}</span>
                                </div>
                                {disaster.location.name && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{disaster.location.name}</span>
                                  </div>
                                )}
                              </>
                            )}
                            {distance !== null && (
                              <Badge variant="outline" className="text-xs">
                                {distance.toFixed(0)} km away
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 ml-4">
                        <Badge variant="outline" className={getSeverityColor(disaster.severity)}>
                          {disaster.severity}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(disaster.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-border/20 pt-4 space-y-4">
                        {disaster.magnitude && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">Magnitude:</span>
                            <Badge variant="secondary">{disaster.magnitude}</Badge>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Coordinates:</span>
                            <p className="text-muted-foreground">
                              {disaster.location.lat.toFixed(4)}, {disaster.location.lng.toFixed(4)}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Event ID:</span>
                            <p className="text-muted-foreground font-mono">{disaster.id}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => onDisasterClick(disaster)}
                          className="bg-primary hover:bg-primary-glow transition-all duration-300 hover:scale-105 hover:shadow-glow"
                        >
                          <MapPin className="h-3 w-3 mr-2" />
                          View on Map
                        </Button>
                        
                        {disaster.url && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            asChild
                            className="border-2 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                          >
                          <a href={disaster.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Full Report
                          </a>
                          </Button>
                        )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Nearby Disasters Section */}
      {userLocation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">📍 Nearby Disasters (within 500 km)</h2>
            <Badge variant="outline" className="text-sm">
              {nearbyDisasters.length} Event{nearbyDisasters.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          {renderDisasterGroup(nearbyDisasters, 'Nearby Disasters')}
        </div>
      )}

      {/* All India Disasters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">🇮🇳 All India Disasters</h2>
          <Badge variant="outline" className="text-sm">
            {indiaWideDisasters.length} Active Alert{indiaWideDisasters.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        {renderDisasterGroup(indiaWideDisasters, 'All India')}
      </div>
    </div>
  );
};

export default DisasterList;