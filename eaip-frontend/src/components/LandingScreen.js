import React from 'react';
import './LandingScreen.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkedAlt, faPlaneDeparture, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import logo from '../MA.png';

function LandingScreen({ onSelectMode }) {
    return (
        <div className="landing-screen">
            <div className="landing-content">
                <div className="header-section">
                    <img src={logo} alt="vAIP Morocco Logo" className="landing-logo" />
                    <h1 className="landing-title">vAIP Morocco</h1>
                    <p className="landing-subtitle">Virtual Aviation Portal</p>
                </div>

                <div className="mode-cards">
                    {/* vAIP Mode - Neon Green Glow */}
                    <div className="mode-card vaip-card" onClick={() => onSelectMode('vaip')}>
                        <div className="card-icon-wrapper">
                            <FontAwesomeIcon icon={faMapMarkedAlt} />
                        </div>
                        <h2>Aeronautical Charts</h2>
                        <p>Comprehensive eAIP data, airport charts, and ground reference for virtual pilots.</p>
                    </div>

                    {/* Real Ops Mode - Crimson Red Glow */}
                    <div className="mode-card realops-card" onClick={() => onSelectMode('realops')}>
                        <div className="card-icon-wrapper">
                            <FontAwesomeIcon icon={faPlaneDeparture} />
                        </div>
                        <h2>Real Flight Ops</h2>
                        <p>Live real-world schedule integration, flight tracking, and operational data.</p>
                    </div>
                </div>
            </div>

            <footer className="landing-footer">
                <div className="footer-left">
                    <span>© 2025 IVAO Morocco division. For simulation use only.</span>
                    <span className="credits">Photo by <a href="https://www.instagram.com/atlas_spotter/" target="_blank" rel="noopener noreferrer">@atlas_spotter</a></span>
                </div>
                <a href="https://ma.ivao.aero" target="_blank" rel="noopener noreferrer" className="ivao-link">
                    Official Website <FontAwesomeIcon icon={faExternalLinkAlt} size="sm" />
                </a>
            </footer>
        </div>
    );
}

export default LandingScreen;
