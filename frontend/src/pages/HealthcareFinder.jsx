import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import healthcareService from '../services/healthcareService';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, MapPin, Navigation, Phone, Globe, Loader2, AlertCircle, Map as MapIcon, ChevronRight, Compass } from 'lucide-react';

// Fix Leaflet marker icons issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom pin for Search Center / Current User
const searchCenterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, Math.max(map.getZoom(), 12), { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
};

// Map click listener to let user click anywhere to search from that exact spot
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const HealthcareFinder = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [searchAddress, setSearchAddress] = useState('');
  const [radius, setRadius] = useState(15);
  const [type, setType] = useState('all');
  
  const [userLocation, setUserLocation] = useState(null);
  const [searchOrigin, setSearchOrigin] = useState(null); // { lat, lng, name }
  const [mapCenter, setMapCenter] = useState([12.9141, 74.8560]); // Default to coastal Karnataka

  const requestCurrentLocation = (autoSearch = false) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          setSearchOrigin({ lat: loc.lat, lng: loc.lng, name: 'Your GPS Location' });
          setMapCenter([loc.lat, loc.lng]);
          setSearchAddress('');
          if (autoSearch) {
            fetchFacilities({ lat: loc.lat, lng: loc.lng, radius, type });
          }
        },
        (err) => {
          console.warn('Geolocation denied or unavailable', err);
          if (autoSearch) {
            setError('Could not access device GPS location. Please allow location permissions or type an address.');
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  };

  useEffect(() => {
    requestCurrentLocation(false);
  }, []);

  const fetchFacilities = async (params) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await healthcareService.getNearbyFacilities(params);
      
      if (response.success) {
        setFacilities(response.data);
        if (response.searchCenter?.lat && response.searchCenter?.lng) {
          const center = [response.searchCenter.lat, response.searchCenter.lng];
          setMapCenter(center);
          setSearchOrigin({
            lat: response.searchCenter.lat,
            lng: response.searchCenter.lng,
            name: response.searchCenter.formattedAddress || searchAddress || 'Search Center'
          });
        } else if (params.lat && params.lng) {
          setMapCenter([params.lat, params.lng]);
          setSearchOrigin({
            lat: params.lat,
            lng: params.lng,
            name: searchAddress || 'Selected Location'
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to search for healthcare facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    const params = { radius, type };
    if (searchAddress.trim()) {
      params.address = searchAddress.trim();
    } else if (searchOrigin) {
      params.lat = searchOrigin.lat;
      params.lng = searchOrigin.lng;
    } else if (userLocation) {
      params.lat = userLocation.lat;
      params.lng = userLocation.lng;
    } else {
      setError('Please enter a location, click the GPS icon, or click anywhere on the map.');
      return;
    }

    fetchFacilities(params);
  };

  const handleMapClick = (latlng) => {
    setSearchAddress(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    setSearchOrigin({
      lat: latlng.lat,
      lng: latlng.lng,
      name: `Point (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`
    });
    setMapCenter([latlng.lat, latlng.lng]);
    fetchFacilities({ lat: latlng.lat, lng: latlng.lng, radius, type });
  };

  return (
    <Layout>
      <div className="flex items-center mb-2 mt-2 animate-slide-up">
        <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-2 rounded-xl mr-3 shadow-lg shadow-primary-500/30">
          <MapIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Find Healthcare Nearby</h1>
      </div>
      <p className="text-base text-slate-500 mb-8 ml-11 animate-slide-up">
        Locate verified hospitals, clinics, and pharmacies. Distances are computed via actual road routes.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Search Panel */}
        <div className="lg:col-span-4 space-y-6 animate-slide-up animate-delay-100">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Location</label>
                  <span className="text-xs text-slate-400 font-medium">Or click map</span>
                </div>
                <div className="flex rounded-2xl shadow-sm bg-white border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                  <div className="flex items-center pl-4 bg-transparent">
                    <MapPin className="h-5 w-5 text-primary-500" />
                  </div>
                  <input
                    type="text"
                    className="flex-1 w-full border-none py-3 px-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 bg-transparent font-medium"
                    placeholder={userLocation && !searchAddress ? "Using current location..." : "Enter city, town, or address"}
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => requestCurrentLocation(true)}
                    className="flex items-center justify-center px-4 bg-slate-50 hover:bg-slate-100 border-l border-slate-200 text-primary-600 hover:text-primary-700 transition-colors"
                    title="Use GPS current location"
                  >
                    <Navigation className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Distance</label>
                  <select
                    value={radius}
                    onChange={(e) => {
                      const newRadius = Number(e.target.value);
                      setRadius(newRadius);
                      if (searchOrigin || searchAddress) {
                        const params = { radius: newRadius, type };
                        if (searchAddress.trim()) params.address = searchAddress.trim();
                        else if (searchOrigin) { params.lat = searchOrigin.lat; params.lng = searchOrigin.lng; }
                        fetchFacilities(params);
                      }
                    }}
                    className="block w-full rounded-2xl border border-slate-200 py-3 pl-4 pr-10 bg-white font-medium text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={15}>15 km</option>
                    <option value={20}>20 km</option>
                    <option value={30}>30 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 py-3 pl-4 pr-10 bg-white font-medium text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    <option value="all">All</option>
                    <option value="hospitals">Hospitals Only</option>
                    <option value="clinics">Clinics & Doctors</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 flex justify-center items-center gap-2 rounded-2xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Finding Nearest Facilities...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Search Facilities
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50/80 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 animate-slide-up">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* Facilities List Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="text-lg font-black text-slate-800">Results</h3>
                {searchOrigin && (
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">
                    Within {radius} km of {searchOrigin.name}
                  </p>
                )}
              </div>
              <span className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full border border-primary-100">
                {facilities.length} found
              </span>
            </div>

            {facilities.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {facilities.map((facility) => (
                  <div
                    key={facility.id}
                    onClick={() => setMapCenter([facility.latitude, facility.longitude])}
                    className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-base font-bold text-slate-800 group-hover:text-primary-600 transition-colors leading-snug">
                          {facility.name}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full capitalize">
                            {facility.type}
                          </span>
                          
                          {facility.isRoadDistance ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              🚗 Road Distance
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                              Straight line
                            </span>
                          )}
                        </div>

                        {facility.estimatedDuration && (
                          <div className="mt-2 inline-flex items-center text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                            ⏱️ {facility.estimatedDuration} drive
                          </div>
                        )}

                        <p className="text-xs text-slate-500 mt-2.5 flex items-start leading-relaxed">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-primary-500 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-600">{facility.address}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-xs font-black text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-xl shadow-xs">
                          {facility.distance} km
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all mt-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && (
              <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 p-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <MapIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">No facilities within {radius} km</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                  No verified hospitals or clinics found within {radius} km road distance.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => {
                      setRadius(20);
                      const params = { radius: 20, type };
                      if (searchAddress.trim()) params.address = searchAddress.trim();
                      else if (searchOrigin) { params.lat = searchOrigin.lat; params.lng = searchOrigin.lng; }
                      fetchFacilities(params);
                    }}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold rounded-xl border border-primary-200 transition-colors"
                  >
                    Expand to 20 km
                  </button>
                  <button
                    onClick={() => {
                      setRadius(30);
                      const params = { radius: 30, type };
                      if (searchAddress.trim()) params.address = searchAddress.trim();
                      else if (searchOrigin) { params.lat = searchOrigin.lat; params.lng = searchOrigin.lng; }
                      fetchFacilities(params);
                    }}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    Expand to 30 km
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Panel */}
        <div className="lg:col-span-8 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm relative min-h-[500px] lg:min-h-[700px] flex flex-col animate-slide-up animate-delay-200">
          <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700 pointer-events-none">
            <Compass className="w-4 h-4 text-primary-500" />
            <span>Click anywhere on the map to set location & search</span>
          </div>

          <MapContainer 
            center={mapCenter} 
            zoom={12} 
            className="w-full h-full rounded-2xl flex-1 z-0 min-h-[500px]"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapUpdater center={mapCenter} />
            <MapClickHandler onMapClick={handleMapClick} />

            {/* Visual Radius Circle */}
            {searchOrigin && (
              <Circle
                center={[searchOrigin.lat, searchOrigin.lng]}
                radius={radius * 1000}
                pathOptions={{
                  color: '#0d9488',
                  fillColor: '#14b8a6',
                  fillOpacity: 0.08,
                  weight: 2,
                  dashArray: '6, 6'
                }}
              />
            )}

            {/* Search Center / Origin Pin (Red) */}
            {searchOrigin && (
              <Marker 
                position={[searchOrigin.lat, searchOrigin.lng]}
                icon={searchCenterIcon}
              >
                <Popup>
                  <div className="p-1 font-sans text-center">
                    <strong className="text-slate-900 block font-bold text-sm">📍 {searchOrigin.name}</strong>
                    <span className="text-xs text-primary-600 font-semibold block mt-1">Search Origin ({radius} km perimeter)</span>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Healthcare Facility Pins (Blue) */}
            {facilities.map((facility) => (
              <Marker 
                key={facility.id} 
                position={[facility.latitude, facility.longitude]}
              >
                <Popup className="premium-popup">
                  <div className="font-sans min-w-[220px] max-w-[280px]">
                    <strong className="block text-base font-bold text-slate-900 leading-tight mb-1">{facility.name}</strong>
                    <div className="flex flex-wrap items-center gap-1 mb-2">
                      <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-bold rounded capitalize">{facility.type}</span>
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded">{facility.distance} km {facility.isRoadDistance ? '(by road)' : ''}</span>
                    </div>

                    {facility.estimatedDuration && (
                      <div className="mb-2 text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100">
                        🚗 Estimated Drive: {facility.estimatedDuration}
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-600 space-y-2 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-start">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary-500 shrink-0 mt-0.5" />
                        <span className="leading-snug text-slate-700 font-medium">{facility.address}</span>
                      </div>
                      
                      {facility.phone !== 'Phone unlisted' && facility.phone !== 'Not available' && (
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                          <a href={`tel:${facility.phone}`} className="text-primary-600 hover:text-primary-700 font-bold hover:underline">{facility.phone}</a>
                        </div>
                      )}
                      
                      {facility.website !== 'Website unlisted' && facility.website !== 'Not available' && (
                        <div className="flex items-center">
                          <Globe className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                          <a href={facility.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-bold hover:underline truncate max-w-[170px] inline-block align-bottom">{facility.website}</a>
                        </div>
                      )}
                    </div>
                    
                    <a 
                      href={
                        searchOrigin 
                          ? `https://www.google.com/maps/dir/?api=1&origin=${searchOrigin.lat},${searchOrigin.lng}&destination=${facility.latitude},${facility.longitude}`
                          : `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center text-center bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl px-3 py-2 text-xs font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5 mr-1.5" /> Get Road Directions
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          border-radius: 1rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          padding: 0;
          border: 1px solid #f1f5f9;
        }
        .leaflet-popup-content {
          margin: 16px;
        }
        .leaflet-popup-tip {
          background: white;
          border-top: 1px solid #f1f5f9;
          border-left: 1px solid #f1f5f9;
        }
      `}} />
    </Layout>
  );
};

export default HealthcareFinder;
