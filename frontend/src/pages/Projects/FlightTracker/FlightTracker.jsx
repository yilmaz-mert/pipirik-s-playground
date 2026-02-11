import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardBody, Chip, Button, Divider } from "@nextui-org/react";
import 'leaflet/dist/leaflet.css';
import './FlightTracker.css';

// Resize helper: invalidate map size when container changes
const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

// Map listener to expose map instance to the parent component
const MapListener = ({ onMapReady }) => {
  const map = useMap();
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  return null;
};

// Icon cache: avoid recreating identical DivIcon for same angle/selection
const _planeIconCache = new Map();
const CREATE_PLANE_ICON = (TRACK, IS_SELECTED) => {
  // bucket angle to reduce number of distinct icons (every 5°)
  const bucket = Math.round(TRACK / 5) * 5;
  const key = `${bucket}_${IS_SELECTED ? 1 : 0}`;
  if (_planeIconCache.has(key)) return _planeIconCache.get(key);
  const html = `
    <div style="
      transform: rotate(${bucket}deg); 
      pointer-events: none;
      color: ${IS_SELECTED ? '#bef264' : '#06b6d4'}; 
      filter: drop-shadow(0 0 ${IS_SELECTED ? '12px' : '4px'} ${IS_SELECTED ? '#bef264' : '#06b6d4'});
      transition: transform 0.1s linear;
      display: flex; align-items: center; justify-content: center;
    ">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    </div>`;
  const icon = new L.DivIcon({ html, className: 'custom-plane-icon', iconSize: [32, 32], iconAnchor: [16, 16] });
  _planeIconCache.set(key, icon);
  return icon;
};

// --- Airport list and helpers for generating random flights ---
const AIRPORTS = [
  { code: 'IST', name: 'Istanbul', lat: 41.275, lng: 28.751, country: 'tr', weight: 100 },
  { code: 'LHR', name: 'London Heathrow', lat: 51.47, lng: -0.454, country: 'gb', weight: 95 },
  { code: 'JFK', name: 'New York JFK', lat: 40.641, lng: -73.778, country: 'us', weight: 90 },
  { code: 'DXB', name: 'Dubai Intl', lat: 25.253, lng: 55.365, country: 'ae', weight: 92 },
  { code: 'HND', name: 'Tokyo Haneda', lat: 35.549, lng: 139.779, country: 'jp', weight: 88 },
  { code: 'CDG', name: 'Paris CDG', lat: 49.009, lng: 2.547, country: 'fr', weight: 85 },
  { code: 'AMS', name: 'Amsterdam Schiphol', lat: 52.31, lng: 4.768, country: 'nl', weight: 82 },
  { code: 'FRA', name: 'Frankfurt', lat: 50.037, lng: 8.562, country: 'de', weight: 75 },
  { code: 'SIN', name: 'Singapore Changi', lat: 1.364, lng: 103.991, country: 'sg', weight: 70 },
  { code: 'LAX', name: 'Los Angeles Intl', lat: 33.941, lng: -118.408, country: 'us', weight: 78 },
  { code: 'SYD', name: 'Sydney Kingsford Smith', lat: -33.939, lng: 151.175, country: 'au', weight: 45 },
  { code: 'GRU', name: 'São Paulo', lat: -23.435, lng: -46.473, country: 'br', weight: 40 },
  { code: 'DEL', name: 'Delhi Indira Gandhi', lat: 28.556, lng: 77.1, country: 'in', weight: 65 },
  { code: 'YYZ', name: 'Toronto Pearson', lat: 43.677, lng: -79.624, country: 'ca', weight: 55 },
  { code: 'DOH', name: 'Doha Hamad', lat: 25.273, lng: 51.608, country: 'qa', weight: 72 },
  { code: 'CPT', name: 'Cape Town', lat: -33.971, lng: 18.602, country: 'za', weight: 25 },
  { code: 'SCL', name: 'Santiago', lat: -33.393, lng: -70.785, country: 'cl', weight: 20 },
  { code: 'AKL', name: 'Auckland', lat: -37.008, lng: 174.783, country: 'nz', weight: 15 },
  { code: 'HEL', name: 'Helsinki', lat: 60.317, lng: 24.963, country: 'fi', weight: 30 },
  { code: 'ESB', name: 'Ankara Esenboğa', lat: 40.128, lng: 32.995, country: 'tr', weight: 50 }
];

const weightedPick = (items) => {
  const total = items.reduce((s, it) => s + (it.weight || 1), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= (it.weight || 1);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
};

const haversineKm = (aLat, aLng, bLat, bLng) => {
  const R = 6371; // km
  const toRad = v => v * Math.PI / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLng - aLng);
  const lat1 = toRad(aLat), lat2 = toRad(bLat);
  const sinDlat = Math.sin(dLat/2), sinDlon = Math.sin(dLon/2);
  const a = sinDlat*sinDlat + Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const bearingBetween = (aLat, aLng, bLat, bLng) => {
  const toRad = v => v * Math.PI / 180;
  const toDeg = v => v * 180 / Math.PI;
  const y = Math.sin(toRad(bLng - aLng)) * Math.cos(toRad(bLat));
  const x = Math.cos(toRad(aLat)) * Math.sin(toRad(bLat)) - Math.sin(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.cos(toRad(bLng - aLng));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

// Great-circle interpolation helpers
const toRad = v => v * Math.PI / 180;
const toDeg = v => v * 180 / Math.PI;
const latLngToVector = (lat, lng) => {
  const phi = toRad(lat);
  const lambda = toRad(lng);
  return [Math.cos(phi) * Math.cos(lambda), Math.cos(phi) * Math.sin(lambda), Math.sin(phi)];
};
const vectorToLatLng = (v) => {
  const [x, y, z] = v;
  const hyp = Math.sqrt(x * x + y * y);
  const lat = toDeg(Math.atan2(z, hyp));
  const lng = toDeg(Math.atan2(y, x));
  return [lat, lng];
};

const slerp = (v0, v1, t) => {
  const dot = v0[0]*v1[0] + v0[1]*v1[1] + v0[2]*v1[2];
  const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
  if (Math.abs(theta) < 1e-6) return v0;
  const sinTheta = Math.sin(theta);
  const a = Math.sin((1 - t) * theta) / sinTheta;
  const b = Math.sin(t * theta) / sinTheta;
  return [v0[0]*a + v1[0]*b, v0[1]*a + v1[1]*b, v0[2]*a + v1[2]*b];
};

const greatCirclePoint = (aLat, aLng, bLat, bLng, t) => {
  const v0 = latLngToVector(aLat, aLng);
  const v1 = latLngToVector(bLat, bLng);
  const vi = slerp(v0, v1, t);
  return vectorToLatLng(vi);
};

const greatCirclePath = (aLat, aLng, bLat, bLng, segments = 40) => {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    pts.push(greatCirclePoint(aLat, aLng, bLat, bLng, t));
  }
  return pts;
};

// compute a single flight's derived state for given timestamp (pure helper)
const computeFlightState = (f, now) => {
  const totalMs = f.durationMin * 60000;
  const elapsed = Math.min(totalMs, Math.max(0, (now - f.departTime)));
  const progress = totalMs <= 0 ? 1 : elapsed / totalMs;

  const segmentIndex = Math.max(0, Math.min(f.route.length - 1, Math.floor(progress * (f.route.length - 1))));
  const segT = (progress * (f.route.length - 1)) - segmentIndex;
  const a = f.route[segmentIndex];
  const b = f.route[Math.min(f.route.length - 1, segmentIndex + 1)];
  const lat = a[0] + (b[0] - a[0]) * segT;
  const lng = a[1] + (b[1] - a[1]) * segT;

  let track;
  if (a && b && (a[0] !== b[0] || a[1] !== b[1])) {
    track = Math.round(bearingBetween(a[0], a[1], b[0], b[1]));
  } else {
    track = Math.round(bearingBetween(f.origin.lat, f.origin.lng, f.destination.lat, f.destination.lng));
  }

  const climbEnd = 0.10, descentStart = 0.90;
  let alt = f.cruiseAlt || f.alt || 30000;
  let gs = f.cruiseGs || f.gs || 420;

  if (progress < climbEnd) {
    const p = progress / climbEnd;
    const ease = 1 - Math.pow(1 - p, 2);
    const departAlt = Math.min(2000, (f.type && f.type.toLowerCase().includes('cessna')) ? 500 : 1000);
    alt = Math.round(departAlt + ( (f.cruiseAlt || alt) - departAlt) * ease);
    const departGs = Math.max(60, Math.round((f.cruiseGs || gs) * 0.5));
    gs = Math.round(departGs + ((f.cruiseGs || gs) - departGs) * ease);
  } else if (progress >= descentStart) {
    const p = (progress - descentStart) / (1 - descentStart);
    const ease = Math.pow(p, 2);
    const arrivalAlt = 0;
    alt = Math.round((f.cruiseAlt || alt) * (1 - ease) + arrivalAlt * ease);
    const arrivalGs = Math.max(60, Math.round((f.cruiseGs || gs) * 0.35));
    gs = Math.round((f.cruiseGs || gs) * (1 - ease) + arrivalGs * ease);
  } else {
    const wind = Math.sin(now / 10000 + (f.windPhase || 0)) * 5;
    gs = Math.round((f.cruiseGs || gs) + wind);
    alt = Math.round(f.cruiseAlt || alt);
  }

  return { ...f, lat, lng, progress, track, alt, gs };
};

const randCallsign = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const pfx = letters.charAt(Math.floor(Math.random()*letters.length)) + letters.charAt(Math.floor(Math.random()*letters.length));
  const num = Math.floor(100 + Math.random()*800);
  return `${pfx}${num}`;
};

const generateFlight = () => {
  // pick country first using country weights, then choose an airport within
  const chosenCountry = weightedPickCountry();
  const airportsInCountry = AIRPORTS.filter(a => a.country === chosenCountry.code);
  const from = (airportsInCountry.length > 0) ? weightedPick(airportsInCountry) : weightedPick(AIRPORTS);
  // pick aircraft type
  const aircraft = weightedPick(AIRCRAFT_TYPES);
  const isHeli = HELI_MODELS.has(aircraft.model);

  let to = weightedPick(AIRPORTS);
  let tries = 0;
  while (to.code === from.code && tries++ < 8) to = weightedPick(AIRPORTS);

  // For helicopters, prefer nearby airports or short offsets
  let destLat = to.lat;
  let destLng = to.lng;
  if (isHeli) {
    // find nearby airports within ~400 km
    const nearby = AIRPORTS.filter(a => a.code !== from.code && haversineKm(from.lat, from.lng, a.lat, a.lng) <= 400);
    if (nearby.length > 0) {
      const pick = weightedPick(nearby);
      destLat = pick.lat; destLng = pick.lng; to = pick;
    } else {
      // fallback: small random offset ~ up to ~0.6 degrees
      const off = () => (Math.random() - 0.5) * 1.2;
      destLat = from.lat + off();
      destLng = from.lng + off();
    }
  }

  const distance = haversineKm(from.lat, from.lng, destLat, destLng);
  // duration: planes faster; helicopters slower and short-range
  const avgSpeedKmph = aircraft.speed || 450; // use aircraft spec
  const durationMin = Math.max(5, Math.round(distance / avgSpeedKmph * 60));
  const depart = Date.now() - Math.floor(Math.random() * durationMin * 60000);

  const gs = Math.max(80, Math.round(aircraft.speed + (Math.random() - 0.5) * 40));
  const alt = aircraft.alt || Math.round(10000 + Math.random() * 30000);
  const windPhase = Math.random() * Math.PI * 2;

  // Precompute great-circle route for a subtle curve on the map
  const route = greatCirclePath(from.lat, from.lng, destLat, destLng, 60).map(([lat,lng]) => [lat, lng]);

  const id = randCallsign();

  return {
    id,
    callsign: id,
    from: from.name,
    fromCode: from.code,
    to: to.name,
    toCode: to.code,
    origin: { lat: from.lat, lng: from.lng, country: from.country },
    destination: { lat: destLat, lng: destLng, country: to.country },
    departTime: depart,
    durationMin,
    gs,
    alt,
    cruiseAlt: alt,
    cruiseGs: gs,
    windPhase,
    route,
    track: Math.round(bearingBetween(from.lat, from.lng, destLat, destLng)),
    progress: Math.min(1, Math.max(0, (Date.now() - depart) / (durationMin * 60000))),
    lat: from.lat,
    lng: from.lng,
    type: aircraft.model,
    isHelicopter: isHeli,
    countryCode: from.country || 'un'
  };
};

// --- Aircraft types including helicopters ---
const AIRCRAFT_TYPES = [
  { model: 'Airbus A320neo', speed: 450, alt: 36000, weight: 100 },
  { model: 'Boeing 737-800', speed: 440, alt: 35000, weight: 95 },
  { model: 'Airbus A321neo', speed: 455, alt: 37000, weight: 85 },
  { model: 'Boeing 787-9', speed: 510, alt: 39000, weight: 60 },
  { model: 'Airbus A350-1000', speed: 515, alt: 40000, weight: 55 },
  { model: 'Boeing 777-300ER', speed: 500, alt: 38000, weight: 50 },
  { model: 'Airbus A380', speed: 490, alt: 41000, weight: 15 },
  { model: 'Bombardier CRJ-900', speed: 420, alt: 31000, weight: 40 },
  { model: 'Embraer E195', speed: 430, alt: 33000, weight: 35 },
  { model: 'Gulfstream G650', speed: 530, alt: 45000, weight: 10 },
  { model: 'Cessna 172', speed: 120, alt: 6000, weight: 20 },
  { model: 'Piper PA-28', speed: 130, alt: 7500, weight: 15 },
  { model: 'Bell 407', speed: 130, alt: 3000, weight: 8 },
  { model: 'Sikorsky S-76', speed: 155, alt: 4500, weight: 5 },
  { model: 'Airbus H145', speed: 140, alt: 4000, weight: 7 }
];

const HELI_MODELS = new Set(['Bell 407','Sikorsky S-76','Airbus H145']);

const _heliIconCache = new Map();
const CREATE_HELI_ICON = (TRACK, IS_SELECTED) => {
  const bucket = Math.round(TRACK / 5) * 5;
  const key = `${bucket}_${IS_SELECTED ? 1 : 0}`;
  if (_heliIconCache.has(key)) return _heliIconCache.get(key);
  const html = `
    <div style="
      transform: rotate(${bucket}deg); 
      transform-origin: center;
      pointer-events: none;
      color: ${IS_SELECTED ? '#facc15' : '#ffd166'}; 
      filter: drop-shadow(0 0 ${IS_SELECTED ? '8px' : '2px'} ${IS_SELECTED ? '#facc15' : '#ffd166'});
      transition: transform 0.06s linear;
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 34px;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 1308 1920" preserveAspectRatio="xMidYMid meet">
        <path d="m347 19179c-241-57-395-312-332-552 35-135-56-39 1886-1982l1819-1820v-2175-2175l-1819-1820c-1694-1695-1821-1824-1850-1885-186-392 217-795 609-609 61 29 198 164 2006 1971l1940 1939 49-111c160-366 406-656 752-886 126-85 333-185 472-230l120-39-2-2489-2-2489-909-243c-500-133-927-250-950-260-177-77-313-226-373-409-24-73-27-98-31-276-3-127 0-216 8-252 37-180 192-334 369-367 33-6 399-10 972-10h919v-75c0-98 15-165 56-252 38-80 119-174 183-213l40-25 1-611c0-670-1-662 60-736 43-52 121-88 188-88 84 0 131 19 189 75 85 83 83 63 83 759l1 601 56 40c133 95 207 240 220 432l6 93h917c582 0 937 4 971 10 166 32 310 159 359 318 29 94 29 423 0 536-49 194-180 353-355 433-45 21-394 118-982 275l-913 243v2490 2491l74 22c171 50 407 167 564 279 332 238 545 493 692 827l64 147 1951-1949c1846-1845 1953-1950 2012-1976 88-38 170-50 257-36 314 49 479 387 329 674-21 39-445 469-1845 1871l-1818 1820v2175 2175l1823 1825c1698 1699 1826 1829 1850 1885 103 238 7 500-223 609-57 27-78 31-170 34-122 4-183-12-275-73-33-22-668-652-1578-1566l-1524-1529-32 11c-18 6-59 9-91 7-48-3-67-10-97-35-63-50-77-84-81-194l-4-96-243-243-242-242-23 59c-103 259-260 493-466 698l-91 90-17 85c-115 578-560 1007-1141 1097-119 18-352 13-460-11-532-115-935-503-1060-1019-14-56-25-113-25-127 0-18-19-42-70-88-183-166-379-448-480-694l-36-87-242 242-242 242v85c0 101-22 156-83 204-29 24-50 31-97 34-32 2-74-1-92-7l-32-11-1546 1544c-1645 1644-1575 1578-1705 1612-56 15-160 17-218 3zm8613-5479v-730h-180-180v552 553l177 177c98 98 179 178 180 178 2 0 3-328 3-730zm-4652 547 172-173v-552-552h-180-180v725c0 399 4 725 8 725s85-78 180-173zm172-2274v-638l-27-77c-27-76-31-82-180-230l-153-153v868 867h180 180zm4480-225v-863l-155 155c-144 143-156 159-180 223l-25 68v640 639h180 180z" transform="matrix(.1 0 0 -.1 0 1920)" fill="currentColor" stroke="none" stroke-width="2" vector-effect="non-scaling-stroke"/>
      </svg>
    </div>`;
  const icon = new L.DivIcon({ html, className: 'custom-heli-icon', iconSize: [34, 34], iconAnchor: [17, 17] });
  _heliIconCache.set(key, icon);
  return icon;
};

// --- Countries list ---
const COUNTRIES = [
  { code: 'tr', name: 'Türkiye', weight: 100 },
  { code: 'us', name: 'USA', weight: 85 },
  { code: 'gb', name: 'UK', weight: 70 },
  { code: 'de', name: 'Germany', weight: 65 },
  { code: 'fr', name: 'France', weight: 60 },
  { code: 'ae', name: 'UAE', weight: 55 },
  { code: 'jp', name: 'Japan', weight: 50 },
  { code: 'qa', name: 'Qatar', weight: 45 },
  { code: 'nl', name: 'Netherlands', weight: 40 },
  { code: 'ch', name: 'Switzerland', weight: 30 },
  { code: 'br', name: 'Brazil', weight: 25 },
  { code: 'au', name: 'Australia', weight: 20 },
  { code: 'no', name: 'Norway', weight: 15 },
  { code: 'is', name: 'Iceland', weight: 5 }
];

const countryCodeFrom = (country) => {
  if (!country) return 'un';
  if (typeof country === 'string' && country.length <= 3) return country.toLowerCase();
  const found = COUNTRIES.find(c => c.name.toLowerCase() === String(country).toLowerCase() || c.code.toLowerCase() === String(country).toLowerCase());
  return found ? found.code : 'un';
};

const weightedPickCountry = () => weightedPick(COUNTRIES);

// Memoized marker component to avoid unnecessary re-renders
const FlightMarker = React.memo(({ f, isSelected, onClick, getFlagUrl, t }) => (
  <React.Fragment>
    <Polyline positions={f.route} pathOptions={{ color: '#888', weight: 1, opacity: 0.18 }} />
    <Marker
      position={[f.lat, f.lng]}
      icon={f.isHelicopter ? CREATE_HELI_ICON(f.track, isSelected) : CREATE_PLANE_ICON(f.track, isSelected)}
      eventHandlers={{ click: () => onClick(f.id) }}
    >
      <Popup>
        <div style={{ minWidth: 160 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={getFlagUrl(f.countryCode || f.from)} alt="flag" style={{ width: 28, height: 18, objectFit: 'cover', borderRadius: 2 }} />
            <strong>{f.callsign}</strong>
          </div>
          <div style={{ marginTop: 6, fontSize: 13 }}>
            <div>{t('flight.country')}: {t(`countries.${(f.countryCode||'un')}`, { defaultValue: f.from })}</div>
            <div>{t('flight.altitude')}: {f.alt} ft</div>
            <div>{t('flight.speed')}: {f.gs} kts</div>
          </div>
        </div>
      </Popup>
    </Marker>
  </React.Fragment>
), (prev, next) => {
  // Only re-render when a few key numeric props or selection changes
  return prev.f.id === next.f.id
    && prev.f.lat === next.f.lat
    && prev.f.lng === next.f.lng
    && prev.f.track === next.f.track
    && prev.f.alt === next.f.alt
    && prev.f.gs === next.f.gs
    && prev.isSelected === next.isSelected;
});


const FlightTracker = () => {
  const MAX_FLIGHTS = 20;
  const createInitialFlights = () => Array.from({ length: MAX_FLIGHTS }, () => generateFlight());

  const [flights, setFlights] = useState(() => createInitialFlights());
  const [selectedId, setSelectedId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isToggleActive, setIsToggleActive] = useState(false);
  
  const flightsRef = useRef(flights);
  const mapRef = useRef(null);
  const trailsRef = useRef({});
  const [trails, setTrails] = useState({});
  const handleMapReady = useCallback((m) => {
    if (!mapRef.current && m) {
      mapRef.current = m;
    }
  }, []);
  const { t } = useTranslation();

  const toggleRef = useRef(null);

  useEffect(() => {
    const handleDocClick = (e) => {
      if (toggleRef.current && !toggleRef.current.contains(e.target)) {
        setIsToggleActive(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  // Find the active (selected) flight's current data
  const activeFlight = useMemo(() => 
    flights.find(f => f.id === selectedId), [flights, selectedId]
  );

  // keep flightsRef in sync with state
  useEffect(() => {
    flightsRef.current = flights;
  }, [flights]);

  // compute a single flight's derived state for a given timestamp
  // NOTE: `computeFlightState` is defined at module scope and reused by effects below.

  // Viewport culling: update in-view flights more often, out-of-view less often
  useEffect(() => {
    const INVIEW_MS = (typeof document !== 'undefined' && !document.hidden) ? 15000 : 60000; // 15s visible, 60s hidden
    const tick = () => {
      const now = Date.now();
      const map = mapRef.current;
      if (!map) return;
      const bounds = map.getBounds();
      const updatedFlights = flightsRef.current.map(f => {
        if (f.id === selectedId) return f;
        // only update flights currently inside viewport
        if (!bounds.contains([f.lat, f.lng])) return f;
        const updated = computeFlightState(f, now);
        return updated.progress >= 1 ? generateFlight() : updated;
      });
      flightsRef.current = updatedFlights;
      setFlights([...updatedFlights]);
    };

    tick();
    const id = setInterval(tick, INVIEW_MS);
    return () => clearInterval(id);
  }, [selectedId]);

  useEffect(() => {
    const OUTFIELD_MS = (typeof document !== 'undefined' && !document.hidden) ? 60000 : 300000; // 60s visible, 5min hidden
    const tick = () => {
      const now = Date.now();
      const map = mapRef.current;
      const bounds = map ? map.getBounds() : null;
      const updatedFlights = flightsRef.current.map(f => {
        if (f.id === selectedId) return f;
        // only update flights currently outside viewport
        const inView = bounds ? bounds.contains([f.lat, f.lng]) : false;
        if (inView) return f;
        const updated = computeFlightState(f, now);
        return updated.progress >= 1 ? generateFlight() : updated;
      });
      flightsRef.current = updatedFlights;
      setFlights([...updatedFlights]);
    };

    tick();
    const id = setInterval(tick, OUTFIELD_MS);
    return () => clearInterval(id);
  }, [selectedId]);

  // Page visibility is read inline where needed via `document.hidden` (no separate state).

  // Selected interval: update selected flight more often and update its trail
  // (trail array only updated for the selected flight to reduce work)
  useEffect(() => {
    const SELECTED_MS = (typeof document !== 'undefined' && !document.hidden) ? 5000 : 60000; // 5s visible, 60s hidden
    if (!selectedId) return undefined;

    const tick = () => {
      const now = Date.now();
      const updatedFlights = flightsRef.current.map(f => {
        if (f.id !== selectedId) return f;
        const updated = computeFlightState(f, now);
        // update trail for selected aircraft
        const currentTrail = trailsRef.current[f.id] || [];
        trailsRef.current[f.id] = [...currentTrail, [updated.lat, updated.lng]].slice(-40);
        setTrails(prev => ({ ...prev, [f.id]: trailsRef.current[f.id] }));
        return updated.progress >= 1 ? generateFlight() : updated;
      });
      flightsRef.current = updatedFlights;
      setFlights([...updatedFlights]);
    };

    tick();
    const id = setInterval(tick, SELECTED_MS);
    return () => clearInterval(id);
  }, [selectedId]);

  const getFlagUrl = (country) => {
    // Accept either a country name or a 2-letter country code
    const code = countryCodeFrom(country);
    return `https://flagcdn.com/w40/${code}.png`;
  };

  const getCountryName = (flight) => {
    // prefer explicit countryCode, fallback to COUNTRIES lookup by name
    const code = (flight.countryCode && String(flight.countryCode).toLowerCase())
      || (COUNTRIES.find(c => c.name.toLowerCase() === String(flight.from).toLowerCase()) || {}).code
      || 'un';
    return t(`countries.${code}`, { defaultValue: flight.from || 'Unknown' });
  };

  return (
    <div className={`tracker-wrapper ${isDarkMode ? 'dark' : ''}`}>
      {/* Theme toggle */}
      <div className={`theme-toggle ${isToggleActive ? 'active' : ''}`} ref={toggleRef}>
        <Button 
          isIconOnly 
          radius="full" 
          variant="faded" 
          onPress={() => { setIsDarkMode(prev => !prev); setIsToggleActive(true); }}
          className="bg-background/60 backdrop-blur-md"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </Button>
      </div>

      <div className="floating-panel">
        <Card isBlurred className="bg-background/60 border-1 border-white/10 shadow-lg">
          <CardBody className="p-3">
            <h3 className="text-cyanAccent font-bold text-lg mb-1">{t('flight.radarStation')}</h3>
            <Chip color="secondary" variant="dot" size="sm" className="text-foreground border-none">
              {t('flight.liveTracking')}
            </Chip>
          </CardBody>
        </Card>
      </div>

      {/* Dynamic info panel */}
      {activeFlight && (
        <div className="detail-panel">
          <Card isBlurred className="bg-background/80 border-1 border-cyanAccent/40 w-full sm:w-[320px] shadow-2xl">
            <CardBody className="p-5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] text-cyanAccent font-bold uppercase tracking-widest">{t('flight.callsign')}</span>
                  <h2 className="text-2xl font-black text-foreground tracking-tighter leading-tight">
                    {activeFlight.callsign}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <img src={getFlagUrl(activeFlight.countryCode || activeFlight.from)} alt="flag" className="w-5 h-auto rounded-sm" />
                    <span className="text-xs text-foreground/70">{getCountryName(activeFlight)}</span>
                  </div>
                </div>
                <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => setSelectedId(null)}>✕</Button>
              </div>

              <Divider className="my-4 opacity-20" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-foreground/40 font-bold uppercase">{t('flight.speed')}</span>
                  <span className="text-lg font-mono text-cyanAccent">{activeFlight.gs} <small className="text-[10px]">KTS</small></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-foreground/40 font-bold uppercase">{t('flight.altitude')}</span>
                  <span className="text-lg font-mono text-purple-400">{activeFlight.alt} <small className="text-[10px]">FT</small></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-foreground/40 font-bold uppercase">{t('flight.direction')}</span>
                  <span className="text-lg font-mono text-foreground">{activeFlight.track}°</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-foreground/40 font-bold uppercase">{t('flight.aircraftType')}</span>
                  <span className="text-[11px] font-bold text-foreground/80">{activeFlight.type}</span>
                </div>
              </div>

              <div className="mt-4 p-2 bg-cyanAccent/10 rounded-lg flex justify-between items-center">
                 <span className="text-[10px] font-bold text-cyanAccent uppercase">{t('flight.position')}</span>
                 <span className="text-[10px] font-mono text-foreground/60">
                   {activeFlight.lat.toFixed(4)}, {activeFlight.lng.toFixed(4)}
                 </span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      <MapContainer center={[39.0, 35.0]} zoom={6} className="leaflet-container" zoomControl={false}>
        <ResizeMap />
        <MapListener onMapReady={handleMapReady} />
        <TileLayer 
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          } 
        />
        
        {selectedId && trails[selectedId] && (
          <Polyline 
            positions={trails[selectedId]} 
            pathOptions={{ color: '#bef264', weight: 4, dashArray: '8, 12', opacity: 0.8 }} 
          />
        )}

        {flights.map((f) => (
          <FlightMarker
            key={f.id}
            f={f}
            isSelected={selectedId === f.id}
            onClick={(id) => setSelectedId(id)}
            getFlagUrl={getFlagUrl}
            t={t}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default FlightTracker;