// src/components/AirportPanel.js
import React, { useState } from 'react';
import './AirportPanel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLightbulb, faCheck, faLink, faGlobe, faBroadcastTower, faBook, faPlane } from '@fortawesome/free-solid-svg-icons';

function AirportPanel({ airport, onClose, darkMode }) {
  const [activeTab, setActiveTab] = useState('overview');

  const getAirportTypeLabel = (type) => {
    const types = {
      'large_airport': 'Large Airport',
      'medium_airport': 'Medium Airport',
      'small_airport': 'Small Airport',
    };
    return types[type] || type;
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
        </div>
        <button className="close-btn u-btn" aria-label="Close panel" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
      </div>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'runways' ? 'active' : ''}`}
          onClick={() => setActiveTab('runways')}
        >
          Runways ({airport.runways?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'frequencies' ? 'active' : ''}`}
          onClick={() => setActiveTab('frequencies')}
        >
          Frequencies
        </button>
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
                  {airport.elevation_ft} ft<br />
                  <small>({airport.elevation_m} m)</small>
                </div>
              </div>

              <div className="info-item">
                <label>Coordinates</label>
                <div className="info-value">
                  {airport.latitude.toFixed(4)}°<br />
                  {airport.longitude.toFixed(4)}°
                </div>
              </div>

              <div className="info-item">
                <label>Country</label>
                <div className="info-value">{airport.country}</div>
              </div>

              <div className="info-item">
                <label>Scheduled Service</label>
                <div className="info-value">
                  {airport.scheduled_service ? (<><FontAwesomeIcon icon={faCheck} /> Yes</>) : (<><FontAwesomeIcon icon={faTimes} /> No</>)}
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
                    <FontAwesomeIcon icon={faGlobe} fixedWidth /> Official Website
                  </a>
                )}
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
                      <h4>{runway.identifier}</h4>
                      <span className={`lighting-badge ${runway.lighting ? 'lit' : 'unlit'}`}>
                        {runway.lighting ? (<><FontAwesomeIcon icon={faLightbulb} fixedWidth /> Lit</>) : 'Unlit'}
                      </span>
                    </div>

                    <div className="runway-details">
                      <div className="detail-row">
                        <span>Length</span>
                        <strong>{runway.length_ft} ft ({runway.length_m} m)</strong>
                      </div>

                      <div className="detail-row">
                        <span>Width</span>
                        <strong>{runway.width_ft} ft ({runway.width_m} m)</strong>
                      </div>

                      <div className="detail-row">
                        <span>Surface</span>
                        <div className="surface-badge" style={{ backgroundColor: getSurfaceColor(runway.surface) }}>
                          {runway.surface}
                        </div>
                      </div>

                      <div className="detail-row">
                        <span>Status</span>
                        <strong>{runway.closed ? '❌ Closed' : '✓ Open'}</strong>
                      </div>
                    </div>

                    {/* ILS Information */}
                    {(runway.le_ils || runway.he_ils) && (
                      <div className="ils-info">
                        <h5><FontAwesomeIcon icon={faPlane} fixedWidth /> Instrument Landing Systems</h5>
                        {runway.le_heading && (
                          <div className="ils-detail">
                            <span>{runway.le_ident} ({runway.le_heading}°)</span>
                            {runway.le_ils && <strong>{runway.le_ils.freq} MHz</strong>}
                          </div>
                        )}
                        {runway.he_heading && (
                          <div className="ils-detail">
                            <span>{runway.he_ident} ({runway.he_heading}°)</span>
                            {runway.he_ils && <strong>{runway.he_ils.freq} MHz</strong>}
                          </div>
                        )}
                      </div>
                    )}
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
                <div className="frequency-table">
                  {airport.frequencies.tower && (
                    <div className="frequency-item">
                      <div className="freq-type"><FontAwesomeIcon icon={faBroadcastTower} fixedWidth /> TWR</div>
                      <div className="freq-value">{airport.frequencies.tower} MHz</div>
                    </div>
                  )}

                  {airport.frequencies.ground && (
                    <div className="frequency-item">
                      <div className="freq-type">GND</div>
                      <div className="freq-value">{airport.frequencies.ground} MHz</div>
                    </div>
                  )}

                  {airport.frequencies.approach && (
                    <div className="frequency-item">
                      <div className="freq-type">APP</div>
                      <div className="freq-value">{airport.frequencies.approach} MHz</div>
                    </div>
                  )}

                  {airport.frequencies.atis && (
                    <div className="frequency-item">
                      <div className="freq-type">ATIS</div>
                      <div className="freq-value">{airport.frequencies.atis} MHz</div>
                    </div>
                  )}

                  {airport.frequencies.unicom && (
                    <div className="frequency-item">
                      <div className="freq-type">UNICOM</div>
                      <div className="freq-value">{airport.frequencies.unicom} MHz</div>
                    </div>
                  )}
                </div>

                {/* All frequencies if available */}
                {airport.frequencies.all_frequencies &&
                  airport.frequencies.all_frequencies.length > 5 && (
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
      </div>
    </div>
  );
}

export default AirportPanel;