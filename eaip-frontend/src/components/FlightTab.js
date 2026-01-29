import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faPlaneArrival, faSync, faBroadcastTower, faPlane, faFileExport, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import './FlightTab.css';

const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

// Flight Status Color Helpers
const getStatusColor = (status) => {
    switch (status) {
        case 'scheduled': return '#2ecc71'; // Green
        case 'boarding': return '#f1c40f'; // Yellow
        case 'departed': return '#3498db'; // Blue
        case 'arrived': return '#95a5a6'; // Gray
        case 'cancelled': return '#e74c3c'; // Red
        default: return '#bdc3c7';
    }
};

const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};

function FlightTab({ airportCode, simbriefId }) {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('departure'); // 'departure', 'arrival'
    const [error, setError] = useState(null);

    const fetchFlights = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE}/api/flights/${airportCode}`);
            if (response.data.success) {
                setFlights(response.data.data);
            } else {
                setError('Failed to load flight data');
            }
        } catch (err) {
            console.error('Error fetching flights:', err);
            setError('Unable to fetch flight schedule. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, [airportCode]);

    // Format time (HH:MM)
    const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // --- External Integrations ---

    // FlightRadar24: Use IATA callsign
    const getFR24Link = (callsignIATA) => {
        if (!callsignIATA) return null;
        const normalized = callsignIATA.replace(/\s+/g, '').toLowerCase();
        // Basic validation: 2-3 letters + 1-4 digits
        if (/^[a-z]{2,3}\d{1,4}$/.test(normalized)) {
            return `https://www.flightradar24.com/data/flights/${normalized}`;
        }
        return null;
    };

    // SimBrief: Use ICAO callsign
    const getSimBriefLink = (flight) => {
        const params = new URLSearchParams({
            orig: flight.origin.icao,
            dest: flight.destination.icao,
            type: flight.aircraft.type,
            date: new Date(flight.departure.scheduled).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ''), // DDMMMYY
            deph: new Date(flight.departure.scheduled).getUTCHours(),
            depm: new Date(flight.departure.scheduled).getUTCMinutes(),
            airline: flight.airline?.codeICAO || flight.callsignICAO.substring(0, 3),
            fltnum: flight.flightNumber.replace(/\D/g, '') || flight.callsignICAO.substring(3)
        });
        // Add API Key if available (for static ID / persistent options)
        if (process.env.REACT_APP_SIMBRIEF_API_KEY) {
            params.set('apikey', process.env.REACT_APP_SIMBRIEF_API_KEY);
            // Optionally set static_id to ensure consistent updates if supported
            // params.set('static_id', flight.id); // Keeping it simple for now as requested
        }

        // Add pilot ID if available
        if (simbriefId && simbriefId.trim()) {
            params.set('userid', simbriefId);
        }

        return `https://www.simbrief.com/system/dispatch.php?${params.toString()}`;
    };

    // IVAO FPL (Placeholder for Phase 3 API integration)
    const handleIVAOFile = (flight) => {
        // For MVP, maybe just alert or console log. PRD says "File to IVAO" button opens modal.
        // We will implement the modal in a later step. For now, a placeholder action.
        console.log('Open IVAO Modal for:', flight.callsignICAO);
        alert(`Coming soon: File flight plan for ${flight.callsignICAO} directly to IVAO!`);
    };

    const filteredFlights = flights; // For Phase 1 MVP, API returns mixed or we assume departure. PRD says default view departures.
    // The mock generator returns flights where origin is the current airport, so they are all departures relative to THIS airport.
    // If we add arrivals later, we filter here.

    return (
        <div className="flight-tab">
            {/* Controls / Filter Header */}
            <div className="flight-controls">
                <div className="flight-filters">
                    <button
                        className={`filter-btn ${filter === 'departure' ? 'active' : ''}`}
                        onClick={() => setFilter('departure')}
                    >
                        <FontAwesomeIcon icon={faPlaneDeparture} /> Departures
                    </button>
                    <button
                        className={`filter-btn ${filter === 'arrival' ? 'active' : ''}`}
                        onClick={() => setFilter('arrival')}
                        disabled // Enable in Phase 2
                        title="Arrivals coming soon"
                    >
                        <FontAwesomeIcon icon={faPlaneArrival} /> Arrivals
                    </button>
                </div>
                <button className="refresh-flights-btn" onClick={fetchFlights} disabled={loading}>
                    <FontAwesomeIcon icon={faSync} spin={loading} />
                </button>
            </div>

            {/* Flight List */}
            <div className="flights-list">
                {loading ? (
                    <div className="flights-loading">
                        <div className="spinner"></div>
                        <p>Loading real-time schedule...</p>
                    </div>
                ) : error ? (
                    <div className="flights-error">{error}</div>
                ) : flights.length === 0 ? (
                    <div className="flights-empty">No flights scheduled in the next 24 hours.</div>
                ) : (
                    flights.map(flight => (
                        <div key={flight.id} className="flight-card">
                            <div className="flight-main-info">
                                <div className="flight-identity">
                                    <div className="airline-logo-placeholder">
                                        {flight.airline.codeIATA}
                                    </div>
                                    <div className="flight-codes">
                                        <span className="flight-number">{flight.flightNumber}</span>
                                        <span className="flight-callsign-sub">
                                            {flight.callsignIATA} ({flight.callsignICAO})
                                        </span>
                                    </div>
                                </div>
                                <div className="flight-status">
                                    <span className="status-dot" style={{ backgroundColor: getStatusColor(flight.status) }}></span>
                                    {getStatusLabel(flight.status)}
                                </div>
                            </div>

                            <div className="flight-route">
                                <div className="route-point">
                                    <span className="route-icao">{flight.origin.icao}</span>
                                    <span className="route-time">{formatTime(flight.departure.scheduled)}</span>
                                </div>
                                <div className="route-arrow">
                                    <span className="duration-text">
                                        {/* Simple duration estimate or from mock */}
                                        Est. {Math.round(flight.distance / 450 * 60)}m
                                    </span>
                                    <div className="arrow-line">→</div>
                                    <span className="aircraft-type">{flight.aircraft.type}</span>
                                </div>
                                <div className="route-point right-align">
                                    <span className="route-icao">{flight.destination.icao}</span>
                                    <span className="route-time">{formatTime(flight.arrival.scheduled)}</span>
                                </div>
                            </div>

                            <div className="flight-actions">
                                {/* Track Live (FlightRadar24) */}
                                {getFR24Link(flight.callsignIATA) && (
                                    <a
                                        href={getFR24Link(flight.callsignIATA)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="action-btn track-btn"
                                        title={`Track ${flight.callsignIATA} on FlightRadar24`}
                                    >
                                        <FontAwesomeIcon icon={faBroadcastTower} /> Track
                                    </a>
                                )}

                                {/* SimBrief */}
                                <a
                                    href={getSimBriefLink(flight)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="action-btn simbrief-btn"
                                    title="Generate SimBrief Flight Plan"
                                >
                                    <FontAwesomeIcon icon={faPlane} /> SimBrief
                                </a>

                                {/* IVAO File (Placeholder) */}
                                <button
                                    className="action-btn ivao-btn"
                                    onClick={() => handleIVAOFile(flight)}
                                    title="File to IVAO (Coming Soon)"
                                >
                                    <FontAwesomeIcon icon={faFileExport} /> IVAO
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="flight-tab-footer">
                <small>Real-world flight data for simulation use only.</small>
            </div>
        </div>
    );
}

export default FlightTab;
