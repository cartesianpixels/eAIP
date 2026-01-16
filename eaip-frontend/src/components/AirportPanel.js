// src/components/AirportPanel.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AirportPanel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLightbulb, faCheck, faGlobe, faBook, faMap, faBroadcastTower, faCloudSun } from '@fortawesome/free-solid-svg-icons';
import ondaCharts from '../data/onda-charts.json';
import missingAirports from '../data/missing-airports.json'; // your manual fallback JSON

function AirportPanel({ airport: rawAirport, onClose, darkMode }) {
  // Merge fallback airport data FIRST so it's available for hooks
  const airport = { ...missingAirports[rawAirport.icao], ...rawAirport };

  const [activeTab, setActiveTab] = useState('overview');
  const [metar, setMetar] = useState(null);
  const [metarLoading, setMetarLoading] = useState(false);

  // Fetch METAR immediately when airport changes
  useEffect(() => {
    const fetchMetar = async () => {
      setMetarLoading(true);
      try {
        // Use relative path for production (Vercel) or localhost for dev. 
        // Vercel rewrites /api/* so we can just use /api/metar/...
        const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
        const response = await axios.get(`${API_BASE}/api/metar/${airport.icao}`);
        if (response.data.success) {
          setMetar(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch METAR', err);
      } finally {
        setMetarLoading(false);
      }
    };
    fetchMetar();
  }, [airport.icao]);

  const getAirportTypeLabel = (type) => {
    const types = {
      'large_airport': 'Large Airport',
      'medium_airport': 'Medium Airport',
      'small_airport': 'Small Airport',
    };
    return types[type] || type || 'Unknown';
  };

  const getSurfaceColor = (surface) => {
    const colors = {
      'ASP': '#8b7355',
      'CON': '#808080',
      'Asphalt': '#8b7355',
      'Concrete': '#808080',
    };
    return colors[surface] || '#999';
  };

  return (
    <div className={`airport-panel ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <div className="panel-header">
        <div className="header-title">
          <h2>{airport.icao}</h2>
          {airport.iata && <span className="iata-badge">{airport.iata}</span>}

          {/* METAR Display in Header */}
          <div className="header-metar">
            {metarLoading ? (
              <small>Loading weather...</small>
            ) : metar ? (
              <div className="mini-weather">
                <div className="weather-top-row">
                  <span className={`flight-category-dot ${metar.flightCategory || 'UNKNOWN'}`} title={`Flight Category: ${metar.flightCategory}`}>● {metar.flightCategory || 'VFR'}</span>
                  <span className="weather-summary">
                    {metar.temp}°C {metar.altim}hPa
                  </span>
                </div>
                <div className="raw-metar-ticker" title={metar.rawOb}>
                  {metar.rawOb}
                </div>
              </div>
            ) : (
              <small className="no-weather">Weather data unavailable</small>
            )}
          </div>
        </div>
        <button className="close-btn u-btn" aria-label="Close panel" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'runways', 'frequencies', 'charts'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="panel-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <div className="info-grid">
              <div className="info-item">
                <label>Type</label>
                <div className="info-value">{getAirportTypeLabel(airport.type)}</div>
              </div>

              <div className="info-item">
                <label>City</label>
                <div className="info-value">{airport.city || 'N/A'}</div>
              </div>

              <div className="info-item">
                <label>Elevation</label>
                <div className="info-value">
                  {airport.elevation_ft || 'N/A'} ft<br />
                  <small>({airport.elevation_m || 'N/A'} m)</small>
                </div>
              </div>

              <div className="info-item">
                <label>Coordinates</label>
                <div className="info-value">
                  {airport.latitude?.toFixed(4) || 'N/A'}°<br />
                  {airport.longitude?.toFixed(4) || 'N/A'}°
                </div>
              </div>

              <div className="info-item">
                <label>Country</label>
                <div className="info-value">{airport.country || 'N/A'}</div>
              </div>

              <div className="info-item">
                <label>Scheduled Service</label>
                <div className="info-value">
                  {airport.scheduled_service ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} /> Yes
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTimes} /> No
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* External Links */}
            {(airport.wikipedia_link || airport.home_link) && (
              <div className="external-links">
                <h4>Links</h4>
                {airport.wikipedia_link && (
                  <a
                    href={airport.wikipedia_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    <FontAwesomeIcon icon={faBook} fixedWidth /> Wikipedia
                  </a>
                )}
                {airport.home_link && (
                  <a
                    href={airport.home_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    <FontAwesomeIcon icon={faGlobe} fixedWidth /> Website
                  </a>
                )}
              </div>
            )}

            {/* Full METAR Details (Optional expansion) */}
            {metar && (
              <div className="metar-details-section">
                <h4>Current Weather</h4>
                <div className="metar-decoded-grid">
                  <div><strong>Wind:</strong> {metar.wdir ? `${metar.wdir}°` : 'Vrbl'} at {metar.wspd || 0} kts</div>
                  <div><strong>Vis:</strong> {metar.visib || '10+'} SM</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Runways Tab */}
        {activeTab === 'runways' && (
          <div className="tab-pane">
            {airport.runways && airport.runways.length > 0 ? (
              <div className="runways-list">
                {airport.runways.map((runway, idx) => (
                  <div key={idx} className="runway-card">
                    <div className="runway-header">
                      <h4>{runway.identifier || `${runway.le_ident}/${runway.he_ident}`}</h4>
                      <span className={`lighting-badge ${runway.lighting ? 'lit' : 'unlit'}`}>
                        {runway.lighting ? (
                          <>
                            <FontAwesomeIcon icon={faLightbulb} fixedWidth /> Lit
                          </>
                        ) : (
                          'Unlit'
                        )}
                      </span>
                    </div>

                    <div className="runway-details">
                      <div className="detail-row">
                        <span>Length</span>
                        <strong>{runway.length_ft || 'N/A'} ft ({runway.length_m || 'N/A'} m)</strong>
                      </div>
                      <div className="detail-row">
                        <span>Width</span>
                        <strong>{runway.width_ft || 'N/A'} ft ({runway.width_m || 'N/A'} m)</strong>
                      </div>
                      <div className="detail-row">
                        <span>Surface</span>
                        <div
                          className="surface-badge"
                          style={{ backgroundColor: getSurfaceColor(runway.surface) }}
                        >
                          {runway.surface || 'N/A'}
                        </div>
                      </div>
                      <div className="detail-row">
                        <span>Status</span>
                        <strong>{runway.closed ? '❌ Closed' : '✓ Open'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No runway data available</div>
            )}
          </div>
        )}

        {/* Frequencies Tab */}
        {activeTab === 'frequencies' && (
          <div className="tab-pane">
            {airport.frequencies && Object.keys(airport.frequencies).length > 0 ? (
              <div className="frequencies-list">
                {['tower', 'ground', 'approach', 'atis', 'unicom'].map(freqType => {
                  const freqVal = airport.frequencies[freqType];
                  if (!freqVal) return null;
                  return (
                    <div key={freqType} className="frequency-item">
                      <div className="freq-type">
                        <FontAwesomeIcon icon={faBroadcastTower} fixedWidth /> {freqType.toUpperCase()}
                      </div>
                      <div className="freq-value">{freqVal} MHz</div>
                    </div>
                  );
                })}

                {airport.frequencies.all_frequencies && airport.frequencies.all_frequencies.length > 5 && (
                  <details className="more-frequencies">
                    <summary>Show all frequencies</summary>
                    <div className="all-freqs">
                      {airport.frequencies.all_frequencies.map((freq, idx) => (
                        <div key={idx} className="frequency-item small">
                          <span className="freq-type">{freq.type}</span>
                          <strong className="freq-value">{freq.frequency_mhz} MHz</strong>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <div className="no-data">No frequency data available</div>
            )}
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="tab-pane">
            <ChartsContent airport={airport} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChartsContent({ airport }) {
  const [activeCategory, setActiveCategory] = useState('GEN');
  const charts = ondaCharts[airport.icao] || [];

  const categories = {
    GEN: ['regional', 'obstacles', 'radar', 'terrain'],
    GND: ['aerodrome', 'parking', 'movement'],
    SID: ['departure'],
    STAR: ['arrival'],
    APP: ['approach', 'visual']
  };

  const filteredCharts = charts.filter(chart =>
    categories[activeCategory].includes(chart.category)
  );

  return (
    <div className="charts-container">
      <div className="chart-tabs">
        {Object.keys(categories).map(cat => (
          <button
            key={cat}
            className={`chart-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            style={{ borderBottomColor: activeCategory === cat ? getCategoryColor(cat) : 'transparent' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="charts-list">
        {filteredCharts.length > 0 ? (
          filteredCharts.map((chart, idx) => (
            <a
              key={idx}
              href={chart.url}
              target="_blank"
              rel="noopener noreferrer"
              className="chart-item"
            >
              <div className="chart-info">
                <span className="chart-name">{chart.name}</span>
                <span className="chart-ident">{chart.identifier}</span>
              </div>
              <FontAwesomeIcon icon={faMap} className="chart-icon" />
            </a>
          ))
        ) : (
          <div className="no-data">No charts available for {activeCategory}</div>
        )}
      </div>
    </div>
  );
}

const getCategoryColor = (cat) => {
  const colors = {
    GEN: '#e74c3c',
    GND: '#f1c40f',
    SID: '#9b59b6',
    STAR: '#3498db',
    APP: '#2ecc71'
  };
  return colors[cat] || '#999';
};

export default AirportPanel;