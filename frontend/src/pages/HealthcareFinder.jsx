import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import healthcareService from '../services/healthcareService';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, MapPin, Navigation, Phone, Globe, Loader2, AlertCircle, Map as MapIcon, ChevronRight } from 'lucide-react';

// Fix Leaflet marker icons issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const HealthcareFinder = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [searchAddress, setSearchAddress] = useState('');
  const [radius, setRadius] = useState(5);
  const [type, setType] = useState('all');
  
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          setMapCenter([loc.lat, loc.lng]);
        },
        (err) => console.warn('Geolocation denied or unavailable', err)
      );
    }
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const params = { radius, type };
      
      if (searchAddress.trim()) {
        params.address = searchAddress;
      } else if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      } else {
        setError('Please enter a location to search or enable geolocation.');
        setLoading(false);
        return;
      }

      const response = await healthcareService.getNearbyFacilities(params);
      
      if (response.success) {
        setFacilities(response.data);
        if (response.data.length > 0) {
          setMapCenter([response.data[0].latitude, response.data[0].longitude]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search for healthcare facilities');
    } finally {
      setLoading(false);
    }
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
        Locate hospitals, clinics, and pharmacies in your area using our interactive map.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Search Panel */}
        <div className="lg:col-span-4 space-y-6 animate-slide-up animate-delay-100">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Location</label>
                <div className="flex rounded-2xl shadow-sm bg-white border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                  <div className="flex items-center pl-4 bg-transparent">
                    <MapPin className="h-5 w-5 text-primary-500" />
                  </div>
                  <input
                    type="text"
                    className="flex-1 w-full border-none py-3 px-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 bg-transparent font-medium"
                    placeholder={userLocation ? "Using current location..." : "Enter city or address"}
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (userLocation) {
                        setSearchAddress('');
                        handleSearch();
                      }
                    }}
                    className="flex items-center justify-center px-4 bg-slate-50 hover:bg-slate-100 border-l border-slate-200 text-slate-500 transition-colors"
                    title="Use my location"
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
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="block w-full rounded-2xl border border-slate-200 py-3 pl-4 pr-10 bg-white font-medium text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    <option value={2}>2 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={20}>20 km</option>
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
                    <option value="hospitals">Hospitals</option>
                    <option value="clinics">Clinics</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-4 text-base font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] hover:shadow-primary-500/50 disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Search className="h-5 w-5 mr-2" />}
                {loading ? 'Searching...' : 'Search Facilities'}
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-4 shadow-sm animate-slide-up">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card rounded-3xl overflow-hidden flex-1 h-[450px] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100/50 bg-white/40 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800">
                Results
              </h3>
              <span className="bg-primary-100 text-primary-700 py-1 px-3 rounded-full text-xs font-bold">{facilities.length} found</span>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {facilities.length > 0 ? (
                <ul className="space-y-2 p-2">
                  {facilities.map((facility, index) => (
                    <li 
                      key={facility.id} 
                      className="rounded-2xl p-4 bg-white/60 border border-white hover:bg-white hover:shadow-md transition-all cursor-pointer group animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => setMapCenter([facility.latitude, facility.longitude])}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-base font-bold text-slate-800 group-hover:text-primary-600 transition-colors leading-tight">{facility.name}</h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md capitalize">{facility.type}</span>
                            {facility.isRoadDistance && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-200">
                                🚗 Road Distance
                              </span>
                            )}
                            {facility.estimatedDuration && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-sky-50 text-sky-700 text-xs font-bold rounded-md border border-sky-200">
                                ⏱️ {facility.estimatedDuration}
                              </span>
                            )}
                          </div>
                          <div className="mt-2.5 flex items-start text-xs text-slate-600 bg-slate-50/80 rounded-xl p-2 border border-slate-100">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary-500 shrink-0 mt-0.5" />
                            <span className="leading-snug break-words">{facility.address}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="inline-flex items-center justify-center rounded-xl bg-primary-50 px-2.5 py-1 text-xs font-black text-primary-700 border border-primary-100 shadow-sm">
                            {facility.distance} km
                          </span>
                          <ChevronRight className="w-4 h-4 mt-3 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MapIcon className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No facilities found. Try adjusting your search criteria or increasing the radius.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Panel */}
        <div className="lg:col-span-8 bg-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-white h-[800px] relative z-0 animate-slide-up animate-delay-200">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            <MapUpdater center={mapCenter} />

            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup className="premium-popup">
                  <div className="font-bold text-slate-800 text-center">Your Current Location</div>
                </Popup>
              </Marker>
            )}

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
                      href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
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
      
      {/* CSS overrides for leaflet popup to make it match premium design */}
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
