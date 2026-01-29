import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCog, faSave } from '@fortawesome/free-solid-svg-icons';
import FlightTab from './FlightTab';
import './AirportPanel.css'; // Reuse basic panel styles

function FlightOpsPanel({ airport, onClose, darkMode }) {
    const [simbriefId, setSimbriefId] = useState(localStorage.getItem('simbrief_pilot_id') || '');
    const [showSettings, setShowSettings] = useState(!simbriefId); // Show settings if ID missing

    const handleSaveId = () => {
        if (simbriefId.trim()) {
            localStorage.setItem('simbrief_pilot_id', simbriefId);
            setShowSettings(false);
        }
    };

    return (
        <div className={`airport-panel flight-ops-panel ${darkMode ? 'dark' : 'light'}`}>
            <div
                className="panel-header"
                style={{
                    backgroundImage: `url(${require('../assets/airport-images/airportpanel.jpg')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="header-overlay"></div>
                <div className="header-title">
                    <h2>{airport.icao}{airport.iata ? `/${airport.iata}` : ''}</h2>
                    {airport.name && <p className="airport-name-subtitle">{airport.name}</p>}
                    <span className="ops-badge">Real Flight Operations</span>
                </div>
                <div className="header-actions">
                    <button
                        className="u-btn settings-btn"
                        onClick={() => setShowSettings(!showSettings)}
                        title="Settings"
                    >
                        <FontAwesomeIcon icon={faCog} />
                    </button>
                    <button className="close-btn u-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            </div>

            <div className="panel-content" style={{ padding: '20px' }}>
                {showSettings ? (
                    <div className="settings-box">
                        <h3>Setup</h3>
                        <p>Enter your SimBrief Pilot ID to enable one-click flight planning.</p>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="SimBrief Pilot ID (e.g. 12345)"
                                value={simbriefId}
                                onChange={(e) => setSimbriefId(e.target.value)}
                            />
                            <button className="save-btn" onClick={handleSaveId}>
                                <FontAwesomeIcon icon={faSave} /> Save
                            </button>
                        </div>
                        <small>You can find this on the SimBrief Account settings page.</small>
                    </div>
                ) : null}

                <FlightTab airportCode={airport.icao} simbriefId={simbriefId} />
            </div>
        </div>
    );
}

export default FlightOpsPanel;
