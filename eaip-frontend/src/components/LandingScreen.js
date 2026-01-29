import React from 'react';
import './LandingScreen.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkedAlt, faPlaneDeparture } from '@fortawesome/free-solid-svg-icons';

function LandingScreen({ onSelectMode }) {
    return (
        <div className="landing-screen">
            <div className="landing-content">
                <img src={require('../MA.png')} alt="vAIP Morocco Logo" className="landing-logo" />
                <h1 className="landing-title">vAIP Morocco</h1>
                <p className="landing-subtitle">Select your experience</p>

                <div className="mode-cards">
                    {/* vAIP Mode */}
                    <div className="mode-card" onClick={() => onSelectMode('vaip')}>
                        <div className="mode-icon">
                            <FontAwesomeIcon icon={faMapMarkedAlt} />
                        </div>
                        <h2>vAIP Morocco</h2>
                        <p>Aeronautical charts, airport data, and ground reference for virtual pilots.</p>
                    </div>

                    {/* Real Ops Mode */}
                    <div className="mode-card" onClick={() => onSelectMode('realops')}>
                        <div className="mode-icon highlight">
                            <FontAwesomeIcon icon={faPlaneDeparture} />
                        </div>
                        <h2>Real Flight Ops</h2>
                        <p>Real-world flight schedules, live tracking, and instant SimBrief/IVAO planning.</p>
                    </div>
                </div>

                <a href="https://ma.ivao.aero" target="_blank" rel="noopener noreferrer" className="ivao-home-btn">
                    Visit IVAO Morocco Website
                </a>
            </div>
        </div>
    );
}

export default LandingScreen;
