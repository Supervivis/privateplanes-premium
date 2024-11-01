import React, {useState, useEffect} from 'react';
import apiService from '../../services/api';
import Heatmap from '../shared/heatmap';
import PaginatedTable from '../shared/paginatedTable';
import ChartFilters from './chartFilters';

const FlightsByAirport = ({ timePeriod, presetData, presetFilters, yearOnYearOverride }) => {
  const [data, setData] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [apiFilters, setApiFilters] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (presetFilters && presetFilters === "reg=") return;
      if (presetData) {
        setData(presetData)
        return
      }
      setData([]);
      setFetching(true);
      const response = await apiService.getFlightsByAirport({timePeriod: timePeriod ? timePeriod : 30, additionalFilters: presetFilters ? presetFilters : apiFilters});
      console.log(response);
      setData(response);
      setFetching(false);
    }
    fetchData();
  }, [timePeriod, apiFilters, presetData, presetFilters]);

  return (
    <div className="card no-padding grid lg:grid-cols-2">
      <div className="map-height flex-grow rounded-t-lg lg:rounded-r-none lg:rounded-l-lg overflow-hidden">
        {data && <Heatmap data={data} containerId={`heatmap-1`} />}
      </div>
      
      <div className="live-flights-container flex flex-col gap-4 p-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <h3 className="text-3xl mr-auto">Top Airports</h3>

          {!presetData && !presetFilters && <ChartFilters setApiFilters={setApiFilters} />}
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
          : <PaginatedTable includeChart={true} data={data} additional={data.length} type="Airports" additionalFilters={presetFilters} yearOnYearOverride={yearOnYearOverride} />
        )}
      </div>
    </div>
  );
};

export default FlightsByAirport;