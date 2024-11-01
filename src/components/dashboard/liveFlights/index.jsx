import React, { useState, useEffect, useContext } from 'react';
import { StateContext } from '../../../context';
import apiService from '../../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-rotatedmarker';
import ChartFilters from "../chartFilters";

import PaginatedTable from '../../shared/paginatedTable';

const airplaneIcon = new L.Icon({
  iconUrl: require('./live_flights_aircraft.png'), // Update with the path to your icon
  iconSize: [35, 35], // Size of the icon
  iconAnchor: [17, 17], // Point of the icon which will correspond to the marker's location
});

const LiveFlightsCard = () => {
  const {numLiveFlights, setNumLiveFlights} = useContext(StateContext);
  const [apiFilters, setApiFilters] = useState("");
  const [fetching, setFetching] = useState(true);
  const [data, setData] = useState([]);
  const mapCenter = [25, 0];
  const zoomLevel = 2;

  useEffect(() => {
    async function fetchData() {
      setFetching(true);
      const response = await apiService.getLiveFlights(apiFilters);
      setData(response.data);

      if (response.data.length !== numLiveFlights && apiFilters === "") setNumLiveFlights(response.data.length);
      setFetching(false);
    }
    fetchData();
  }, [apiFilters]);

  const createFlightMarkers = (data) =>
    data.map((flight, index) => (
      <Marker
        key={index}
        position={[flight.lat, flight.lng]}
        icon={airplaneIcon}
        rotationAngle={flight.dir} // If using Leaflet.RotatedMarker plugin for direction
        rotationOrigin="center center"
      >
        <Popup>
          {flight.aircraft}<br />
          {flight.origin} to {flight.destination}
        </Popup>
      </Marker>
    ));

  return(
  <div className="card no-padding grid lg:grid-cols-2">
    <div className="flex-grow map-height rounded-t-lg lg:rounded-r-none lg:rounded-l-lg overflow-hidden">
      <MapContainer 
        center={mapCenter} 
        zoom={zoomLevel} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}  // Disable zoom control
        scrollWheelZoom={false} // Initially disable zooming with the mouse wheel
        doubleClickZoom={true} // Enable zooming with double click
        touchZoom={true} // Enable zooming with touch
        dragging={true} // Enable panning/dragging
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
        />
        {/* Render flight markers */}
        {createFlightMarkers(data)}
      </MapContainer>
    </div>

    <div className="live-flights-container flex flex-col px-4 gap-4 p-4">
      <div className="flex items-center">
        <h3 className="text-3xl mr-auto">Live Flights</h3>
        <ChartFilters setApiFilters={setApiFilters} />
      </div>

      {fetching && 
        <div className="my-auto flex flex-col justify-center items-center">
          <i className="fa fa-spinner fa-spin text-6xl"></i>
          <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
        </div>
      }

      {!fetching && (
        data.length === 0
        ? <div className="my-auto flex flex-col justify-center items-center">
            <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
            <h3 className="text-xl mt-6">No Data Available.</h3>
          </div>
        : <PaginatedTable title="Live Flights" data={data} additional={data.length} type="Flights" />
      )}
      
    </div>
  </div>)
};

export default LiveFlightsCard;

