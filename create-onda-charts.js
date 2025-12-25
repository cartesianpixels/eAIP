// create-onda-charts.js
// Manually build ONDA charts mapping from official document

const fs = require('fs');
const path = require('path');

const ONDA_CHARTS = {
    "GMAD": [
        { identifier: "AD2GMAD-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMAD-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMAD-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMAD-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMAD-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMAD-29", code: 29, name: "Regional/CTR/TMA Chart", type: "AREA", category: "regional" },
        { identifier: "AD2GMAD-31-1-1", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMAD-31-1-2", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMAD-33-1-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMAD-33-1-2", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMAD-35-2", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAD-39-1-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAD-39-1-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAD-39-1-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAD-39-2-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAD-39-2-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAD-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" },
        { identifier: "AD2GMAD-49", code: 49, name: "Radar Minimum Altitude Chart", type: "RMA", category: "radar" }
    ],
    "GMAG": [
        { identifier: "AD2GMAG-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMAG-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMAG-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMAG-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMAG-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMAG-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAG-39-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAG-39-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAG-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMAT": [
        { identifier: "AD2GMAT-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMAT-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMAT-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMAT-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMAT-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMAT-35-1", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAT-37-1", code: 37, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAT-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMAT-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMAZ": [
        { identifier: "AD2GMAZ-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMAZ-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMAZ-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMAZ-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMAZ-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMFB": [
        { identifier: "AD2GMFB-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMFB-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMFB-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMFB-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMFB-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFB-39-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFB-39-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFB-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMFF": [
        { identifier: "AD2GMFF-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMFF-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMFF-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMFF-20", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMFF-21", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFF-23", code: 37, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFF-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMFF-29", code: 29, name: "Regional/CTR/TMA Chart", type: "AREA", category: "regional" },
        { identifier: "AD2GMFF-35-2", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFF-37-2", code: 37, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFF-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMFI": [
        { identifier: "AD2GMFI-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMFI-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMFI-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMFI-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMFI-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMFI-32-1", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMFI-32-2", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMFI-34-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMFI-41-1", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFI-41-2", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFI-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMFK": [
        { identifier: "AD2GMFK-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMFK-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMFK-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMFK-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMFK-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMFK-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFK-39-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFK-39-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFK-39-4", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFK-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMFO": [
        { identifier: "AD2GMFO-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMFO-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMFO-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMFO-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMFO-23", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMFO-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMFO-27", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMFO-29", code: 29, name: "Regional/CTR/TMA Chart", type: "AREA", category: "regional" },
        { identifier: "AD2GMFO-31-1", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMFO-31-3", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMFO-32-4", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMFO-33-1-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMFO-33-3", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMFO-34-4-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMFO-33-1-2", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFO-34-4-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFO-37-2", code: 37, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFO-39-1-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFO-39-1-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFO-39-2-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFO-39-2-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFO-41-4", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMFO-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ]
};

// Part 2 Data

const ONDA_CHARTS_PART2 = {
    "GMMB": [
        { identifier: "AD2GMMB-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMMB-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMMB-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMMB-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMMB-27", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMMB-41-1", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMB-41-2", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMB-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMMD": [
        { identifier: "AD2GMMD-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMMD-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMMD-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMMD-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMMD-39-1-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMD-39-1-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMD-41-1", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMD-41-2", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMD-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMME": [
        { identifier: "AD2GMME-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMME-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMME-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMME-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMME-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMME-29", code: 29, name: "Regional/CTR/TMA Chart", type: "AREA", category: "regional" },
        { identifier: "AD2GMME-31-1", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMME-31-2", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMME-31-3", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMME-31-4", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMME-33-2", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMME-35-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMME-39-1-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMME-39-2-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMME-39-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMME-39-4", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMME-39-5", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMME-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMMH": [
        { identifier: "AD2GMMH-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMMH-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMMH-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMMH-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMMH-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMMH-29", code: 29, name: "Regional/CTR/TMA Chart", type: "AREA", category: "regional" },
        { identifier: "AD2GMMH-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMH-39-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMH-41-1", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMH-41-2", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMH-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMMI": [
        { identifier: "AD2GMMI-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMMI-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMMI-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMMI-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMMI-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMMI-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMI-39-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMI-39-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMI-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMML": [
        { identifier: "AD2GMML-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMML-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMML-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMML-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMML-23", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMML-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMML-29", code: 29, name: "Regional/CTR/TMA Chart", type: "AREA", category: "regional" },
        { identifier: "AD2GMML-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMML-39-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMML-41-1", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMML-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMMN": [
        { identifier: "AD2GMMN-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMMN-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMMN-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMMN-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMMN-23", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMMN-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMMN-27", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMMN-29", code: 29, name: "Regional/CTR/TMA Chart", type: "AREA", category: "regional" },
        { identifier: "AD2GMMN-31-1-1", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMMN-31-2-1", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMMN-33-1-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMMN-33-2-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMMN-33-1-2", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-33-2-2", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-35.1-1", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-35.1-2", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-35.1-3", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-35.1-4", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-35.2-1", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-35.2-2", code: 35, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39.1-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39.1-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39.1-4", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39.2-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39.2-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39.2-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39.2-4", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39.2-5", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39.2-6", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39-4", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-39-5", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMN-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" },
        { identifier: "AD2GMMN-49", code: 49, name: "Radar Minimum Altitude Chart", type: "RMA", category: "radar" }
    ],
    "GMMT": [
        { identifier: "AD2GMMT-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMMT-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMMT-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMMT-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMMT-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMMW": [
        { identifier: "AD2GMMW-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMMW-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMMW-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMMW-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMMW-23", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMMW-29", code: 29, name: "Regional/CTR Chart", type: "AREA", category: "regional" },
        { identifier: "AD2GMMW-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMW-39-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMW-39-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMW-41-1", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMW-41-2", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMW-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMMX": [
        { identifier: "AD2GMMX-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMMX-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMMX-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMMX-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMMX-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMMX-29", code: 29, name: "Regional/CTR/TMA Chart", type: "AREA", category: "regional" },
        { identifier: "AD2GMMX-31-1", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMMX-31-2", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMMX-33-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMMX-33-2", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMMX-34-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMMX-34-2", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMMX-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMX-39-1-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMX-39-1-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMX-39-1-4", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMX-39-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMX-39-2-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMX-39-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMX-39-3-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMX-41-1", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMX-41-2", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMX-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" },
        { identifier: "AD2GMMX-49", code: 49, name: "ATC Surveillance Minimum Altitude Chart", type: "RMA", category: "radar" }
    ],
    "GMMZ": [
        { identifier: "AD2GMMZ-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMMZ-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMMZ-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMMZ-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMMZ-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMMZ-29", code: 29, name: "Regional/CTR/TMA Chart", type: "AREA", category: "regional" },
        { identifier: "AD2GMMZ-33-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMMZ-34-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMMZ-35-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" },
        { identifier: "AD2GMMZ-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMZ-39-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMZ-39-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMZ-41-1", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMZ-41-2", code: 41, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMMZ-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMTA": [
        { identifier: "AD2GMTA-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMTA-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMTA-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMTA-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMTA-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMTA-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMTA-39-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMTA-39-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMTA-39-4", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMTA-39-5", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMTA-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMTN": [
        { identifier: "AD2GMTN-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMTN-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMTN-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMTN-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMTN-23", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMTN-39-1", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMTN-39-2", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMTN-39-3", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMTN-39-4", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMTN-39-5", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMTN-39-6", code: 39, name: "Instrument Approach Chart", type: "APP", category: "approach" },
        { identifier: "AD2GMTN-43", code: 43, name: "Visual Approach Chart", type: "VAC", category: "approach" }
    ],
    "GMTT": [
        { identifier: "AD2GMTT-15", code: 15, name: "Aerodrome Chart", type: "AD", category: "aerodrome" },
        { identifier: "AD2GMTT-17", code: 17, name: "Parking/Docking Chart", type: "AD", category: "parking" },
        { identifier: "AD2GMTT-19", code: 19, name: "Ground Movement Chart", type: "AD", category: "movement" },
        { identifier: "AD2GMTT-21", code: 21, name: "Obstacles Chart", type: "OBS", category: "obstacles" },
        { identifier: "AD2GMTT-25", code: 25, name: "Precision Approach Terrain Chart", type: "PATA", category: "terrain" },
        { identifier: "AD2GMTT-29", code: 29, name: "Regional/CTR/TMA Chart", type: "AREA", category: "regional" },
        { identifier: "AD2GMTT-31-1", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMTT-31-2", code: 31, name: "Standard Instrument Departure (SID)", type: "SID", category: "departure" },
        { identifier: "AD2GMTT-33-1", code: 33, name: "Standard Terminal Arrival Route (STAR)", type: "STAR", category: "arrival" }
    ]
};

// Merge Part 2 into Part 1
const FINAL_CHARTS = { ...ONDA_CHARTS, ...ONDA_CHARTS_PART2 };

// Calculate total charts
let totalCharts = 0;
Object.values(FINAL_CHARTS).forEach(charts => totalCharts += charts.length);

console.log(`\n📊 ONDA Charts Generator`);
console.log('========================');
console.log(`Part 1 Airports: ${Object.keys(ONDA_CHARTS).length}`);
console.log(`Part 2 Airports: ${Object.keys(ONDA_CHARTS_PART2).length}`);
console.log(`Total Airports:  ${Object.keys(FINAL_CHARTS).length}`);
console.log(`Total Charts:    ${totalCharts}`);

const outputPath = path.join(__dirname, 'eAIP', 'onda-charts.json');
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(FINAL_CHARTS, null, 2));
console.log(`\n✓ Saved to: ${outputPath}`);
