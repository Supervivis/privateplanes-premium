import React, {useState, useEffect} from 'react';
import apiService from '../../services/api';
import Heatmap from '../shared/heatmap';
import PaginatedTable from '../shared/paginatedTable';
import ChartFilters from './chartFilters';

const TopLocations = ({ timePeriod }) => {
  const [cityData, setCityData] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [airportData, setAirportData] = useState(null);
  const [chartType, setChartType] = useState('Airports'); 
  const [fetching, setFetching] = useState(false);
  const [apiFilters, setApiFilters] = useState("");

  useEffect(() => {
    async function fetchData() {
      setFetching(true);
      if (chartType === 'Countries') {
        const countryResponse = await apiService.getFlightsByCountry({
          timePeriod: timePeriod ? timePeriod : 30,
          additionalFilters: apiFilters
        });
        setCountryData(countryResponse);
      }
      else if (chartType === 'Cities') {
        const cityResponse = await apiService.getFlightsByCity({
          timePeriod: timePeriod ? timePeriod : 30,
          additionalFilters: apiFilters
        });
        setCityData(cityResponse);
      }
      else {
        const airportResponse = await apiService.getFlightsByAirport({
          timePeriod: timePeriod ? timePeriod : 30, 
          additionalFilters: apiFilters
        });
        setAirportData(airportResponse);
      }
      setFetching(false);
    }
    fetchData();
  }, [timePeriod, chartType, apiFilters]);

  const chartTypeSelector = () => {
    const charts = ["Cities", "Countries", "Airports"];
  
    const handleSelectChange = (event) => {
      setChartType(event.target.value);
    }
  
    return (
      <div className="interact_button md:ml-auto cursor-pointer">
        <i class="fa-solid fa-city"></i>
        <select value={chartType} onChange={handleSelectChange}>
          {charts.map((chartOption) => (
            <option key={chartOption} value={chartOption}>
              Top {chartOption}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="card no-padding grid lg:grid-cols-2">
      <div className="map-height rounded-t-lg lg:rounded-r-none lg:rounded-l-lg overflow-hidden">
        {airportData && <Heatmap data={airportData} containerId={`heatmap-2`} />}
      </div>
      
      <div className="live-flights-container flex flex-col gap-4 p-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <h3 className="text-3xl">Top Locations</h3>
          
          {chartTypeSelector()}

          <ChartFilters setApiFilters={setApiFilters} />
        </div>

        {fetching && 
          <div className="my-auto flex flex-col justify-center items-center">
            <i className="fa fa-spinner fa-spin text-6xl"></i>
            <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
          </div>
        }

        {!fetching && (
          ((chartType ===  "Cities" && !cityData) || (chartType === "Countries" && !countryData) || (chartType === "Airports" && !airportData))
          ? <div className="my-auto flex flex-col justify-center items-center">
              <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
              <h3 className="text-xl mt-6">No Data Available.</h3>
            </div>
          : chartType === "Cities" 
              ? <PaginatedTable data={cityData} additional={cityData.length} type="Cities" includeChart={true} additionalFilters={apiFilters} />
              : chartType === "Airports"
                ? <PaginatedTable data={airportData} additional={airportData.length} type="Airports" includeChart={true} additionalFilters={apiFilters} />
                : <PaginatedTable data={countryData} additional={countryData.length} type="Countries" includeChart={true} additionalFilters={apiFilters} />
        )}
        
      </div>
    </div>
  );
};

export default TopLocations;