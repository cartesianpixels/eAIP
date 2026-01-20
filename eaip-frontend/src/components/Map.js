// src/components/Map.js
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faPlane } from '@fortawesome/free-solid-svg-icons';
import './Map.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Map({ airports, selectedAirport, onAirportSelect, darkMode, firBoundary, showFIR }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const firLayerRef = useRef(null);

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

      // Create custom icon
      const markerColor = isSelected ? '#E93434' : // Red for selected
        airport.type === 'large_airport' ? '#0D2C99' : // IVAO Dark Blue
          airport.type === 'medium_airport' ? '#3C55AC' : // IVAO Light Blue
            '#D7D7DC'; // Accent Grey for small

      const markerIcon = L.divIcon({
        className: `custom-marker ${isSelected ? 'selected' : ''}`,
        html: `
          <div class="marker-dot" style="background-color: ${markerColor}; color: white;">
            ${renderToStaticMarkup(<FontAwesomeIcon icon={faPlane} style={{ fontSize: '14px' }} />)}
          </div>
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
  useEffect(() => {
    if (!map.current || !firBoundary) return;

    // Remove existing FIR layer if it exists
    if (firLayerRef.current) {
      map.current.removeLayer(firLayerRef.current);
      firLayerRef.current = null;
    }

    // Add FIR boundary if controller is online
    if (showFIR && firBoundary.geometry) {
      const firLayer = L.geoJSON(firBoundary.geometry, {
        style: {
          color: '#0D2C99', // IVAO Dark Blue
          weight: 3,
          opacity: 0.8,
          fillColor: '#3C55AC', // IVAO Light Blue
          fillOpacity: 0.1,
          dashArray: '10, 10'
        }
      }).bindPopup(`
        <div class="fir-popup">
          <strong>${firBoundary.name}</strong><br>
          <small>Upper: ${firBoundary.upperLimit?.value} ${firBoundary.upperLimit?.unit === 1 ? 'ft' : 'FL'}</small><br>
          <small>Lower: ${firBoundary.lowerLimit?.value} ${firBoundary.lowerLimit?.unit === 1 ? 'ft' : 'FL'}</small><br>
          <small>Frequency: ${firBoundary.frequencies?.[0]?.value || 'N/A'} MHz</small>
        </div>
      `).addTo(map.current);

      firLayerRef.current = firLayer;
      console.log('FIR boundary displayed');
    } else {
      console.log('FIR boundary hidden');
    }
  }, [firBoundary, showFIR]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />

      {/* Map Legend */}
      <div className="map-legend">
        <h4>Airport Types</h4>
        <div className="legend-item">
          <div className="legend-icon" style={{ color: '#0D2C99' }}><FontAwesomeIcon icon={faCircle} /></div>
          <span>Large Airport</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon" style={{ color: '#3C55AC' }}><FontAwesomeIcon icon={faCircle} /></div>
          <span>Medium Airport</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon" style={{ color: '#D7D7DC' }}><FontAwesomeIcon icon={faCircle} /></div>
          <span>Small Airport</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon" style={{ color: '#E93434' }}><FontAwesomeIcon icon={faCircle} /></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}

export default Map;