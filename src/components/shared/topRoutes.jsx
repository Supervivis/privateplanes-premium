import React, {useState, useEffect} from 'react';
import apiService from '../../services/api';
import PaginatedTable from './paginatedTable';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import ChartFilters from '../dashboard/chartFilters';

const TopRoutes = ({ timePeriod, presetFilters }) => {
  const [fetching, setFetching] = useState(false);
  const [data, setData] = useState([]);
  const [additionalApiFilters, setAdditionalApiFilters] = useState("");
  const position = [25, 0];
  const zoom = 2;

  useEffect(() => {
    async function fetchData() {
      setFetching(true);
      let filters = presetFilters ? presetFilters : additionalApiFilters;
      const response = await apiService.getTopRoutes(timePeriod ? timePeriod : 30, filters);
      setData(response);
      setFetching(false);
    }
    fetchData();
  }, [timePeriod, additionalApiFilters, presetFilters]);

  return (
    <div className="card no-padding grid lg:grid-cols-2">
      <div className="map-height rounded-t-lg lg:rounded-r-none lg:rounded-l-lg overflow-hidden">
        <MapContainer center={position} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
          />
          {data.slice(0, 750).map((route, index) => (
            <Polyline key={index} positions={[route.start_coords, route.end_coords]} pathOptions={{ color: '#00c1c5', opacity: 0.4 }} />
          ))}
        </MapContainer>
      </div>
                  
      <div className="live-flights-container flex flex-col gap-4 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h3 className="text-3xl mr-auto">Top Routes</h3>

          {!presetFilters && <ChartFilters setApiFilters={setAdditionalApiFilters} />}
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
          : <PaginatedTable data={data} additional={data.length} type="Routes" includeChart={true} />
        )}
      </div>
    </div>
  );
};

export default TopRoutes;