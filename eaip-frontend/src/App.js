// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import logo from './MA.png';
import Map from './components/Map';
import AirportPanel from './components/AirportPanel';
import FlightOpsPanel from './components/FlightOpsPanel';
import LandingScreen from './components/LandingScreen';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSun, faMoon, faSync, faHome } from '@fortawesome/free-solid-svg-icons';
import ivaoService from './services/IvaoService';

function App() {
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [appMode, setAppMode] = useState(null); // 'vaip' or 'realops'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [ivaoStatus, setIvaoStatus] = useState(null);


  const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');

  // Fetch all airports on component mount
  const fetchAirports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching airports from:', API_URL);

      const response = await axios.get(`${API_URL}/api/airports`, {
        timeout: 30000
      });

      if (response.data.success) {
        setAirports(response.data.data);
        console.log(`Loaded ${response.data.data.length} airports`);
      } else {
        setError('Failed to load airports');
      }
    } catch (err) {
      console.error('Error fetching airports:', err);
      setError(err.message || 'Failed to load airports. Make sure the backend is running on port 3000.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchAirports();
  }, [fetchAirports]);

  // Initialize IVAO service and fetch FIR boundary
  useEffect(() => {
    // Start IVAO polling
    // ivaoService.startPolling();

    // Subscribe to status changes
    // const unsubscribe = ivaoService.subscribe((status) => {
    //   console.log('IVAO status update:', status);
    //   setIvaoStatus(status);
    // });



    // Cleanup on unmount
    return () => {
      // ivaoService.stopPolling();
      // unsubscribe();
    };
  }, [API_URL]);

  // Filter airports by search term
  const filteredAirports = airports.filter(airport => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (airport.icao?.toLowerCase() || '').includes(searchLower) ||
      (airport.iata?.toLowerCase() || '').includes(searchLower) ||
      (airport.name?.toLowerCase() || '').includes(searchLower) ||
      (airport.city?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Handle airport selection
  const handleAirportSelect = (airport) => {
    setSelectedAirport(airport);
  };

  // Handle airport close
  const handleClosePanel = () => {
    setSelectedAirport(null);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleModeSelect = (mode) => {
    setAppMode(mode);
  };

  const handleBackToLanding = () => {
    setAppMode(null);
    setSelectedAirport(null);
  };

  if (!appMode) {
    return <LandingScreen onSelectMode={handleModeSelect} />;
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="simulation-banner">
        For simulation use only – Not approved for real-world navigation
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-content" onClick={handleBackToLanding} style={{ cursor: 'pointer' }}>
          <button className="home-btn" onClick={(e) => { e.stopPropagation(); handleBackToLanding(); }} title="Back to Home">
            <FontAwesomeIcon icon={faHome} />
          </button>
          <h1><img src={logo} alt="vAIP Logo" className="header-logo" /> vAIP Morocco</h1>
          <p>Interactive Aeronautical Information Publication</p>
        </div>

        <div className="header-controls">
          {/* Search Bar */}
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search airport (ICAO, IATA, name, city)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-results">
              {filteredAirports.length} of {airports.length}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
          </button>

          {/* Refresh Button */}
          <button
            className="refresh-btn"
            onClick={fetchAirports}
            disabled={loading}
            title="Refresh airport data"
          >
            <FontAwesomeIcon icon={faSync} spin={loading} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="app-container">
        {/* Error Message */}
        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Loading State */}
        {loading && airports.length === 0 ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading airports...</p>
          </div>
        ) : (
          <div className="main-content">
            {/* Map */}
            <Map
              airports={filteredAirports}
              selectedAirport={selectedAirport}
              onAirportSelect={handleAirportSelect}
              darkMode={darkMode}

              showFIR={false}
            />

            {/* Airport Info Panel - Render based on Mode */}
            {selectedAirport && (
              appMode === 'realops' ? (
                <FlightOpsPanel
                  airport={selectedAirport}
                  onClose={handleClosePanel}
                  darkMode={darkMode}
                />
              ) : (
                <AirportPanel
                  airport={selectedAirport}
                  onClose={handleClosePanel}
                  darkMode={darkMode}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2025 IVAO Morocco | vAIP v1.0 | {airports.length} Airports | Data from AirportDB.io</p>
      </footer>
    </div>
  );
}

export default App;