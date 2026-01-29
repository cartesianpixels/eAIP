// src/components/Map.js
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Map({ airports, selectedAirport, onAirportSelect, darkMode }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Create map centered on Morocco
    map.current = L.map(mapContainer.current).setView([31.7917, -7.0926], 6);

    // Add tile layer
    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution = darkMode
      ? '© CartoDB contributors'
      : '© OpenStreetMap contributors';

    L.tileLayer(tileUrl, {
      attribution: attribution,
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [darkMode]);

  // Add/update airport markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      map.current.removeLayer(marker);
    });
    markersRef.current = {};

    // Add new markers
    airports.forEach(airport => {
      const lat = Number(airport?.latitude);
      const lon = Number(airport?.longitude);

      // Skip airports with invalid coordinates
      if (!isFinite(lat) || !isFinite(lon)) {
        console.warn(`Map: skipping airport ${airport?.icao || airport?.name || 'unknown'} due to invalid coords`, airport);
        return;
      }

      const isSelected = selectedAirport?.icao === airport.icao;

      // Determine airport size class
      const sizeClass = airport.type === 'large_airport' ? 'large' :
        airport.type === 'medium_airport' ? 'medium' : 'small';

      const markerIcon = L.divIcon({
        className: `custom-marker ${isSelected ? 'selected' : ''}`,
        html: `
          <div class="marker-dot ${sizeClass}"></div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([lat, lon], {
        icon: markerIcon,
        title: airport.name,
      })
        .bindPopup(`
          <div class="airport-popup">
            <strong>${airport.icao}</strong> ${airport.iata ? `(${airport.iata})` : ''}<br>
            ${airport.name}<br>
            <small>${airport.city}</small>
          </div>
        `)
        .on('click', () => {
          onAirportSelect(airport);
        })
        .addTo(map.current);

      markersRef.current[airport.icao] = marker;
    });
  }, [airports, selectedAirport, onAirportSelect]);

  // Highlight selected airport
  useEffect(() => {
    if (!map.current || !selectedAirport) return;

    const lat = Number(selectedAirport?.latitude);
    const lon = Number(selectedAirport?.longitude);

    if (!isFinite(lat) || !isFinite(lon)) {
      console.warn('Map: selected airport has invalid coordinates, cannot pan/open popup', selectedAirport);
      return;
    }

    // Pan to selected airport
    map.current.setView([lat, lon], 12);

    // Open popup
    const marker = markersRef.current[selectedAirport.icao];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedAirport]);

  // Add/remove FIR boundary based on IVAO status


  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />

      {/* Map Legend */}
      <div className="map-legend">
        <h4>Airport Types</h4>
        <div className="legend-item">
          <div className="legend-icon large"></div>
          <span>Large Airport</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon medium"></div>
          <span>Medium Airport</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon small"></div>
          <span>Small Airport</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon selected"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}

export default Map;