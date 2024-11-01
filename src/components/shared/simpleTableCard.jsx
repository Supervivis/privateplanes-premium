import React, {useState, useEffect} from 'react';
import apiService from '../../services/api';
import PaginatedTable from './paginatedTable';

const SimpleTableCard = ({ title, apiRoute, timePeriod, additionalApiFilters }) => {
  const [data, setData] = useState([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (additionalApiFilters == "reg=") return;
      const response = await apiService[apiRoute](timePeriod ? timePeriod : 30, additionalApiFilters);
      setData(response.data);
      setFetched(true);
    }
    fetchData();
  }, [timePeriod, apiRoute, additionalApiFilters]);

  return(
  <div className="card map-container overflow-y-scroll flex flex-col gap-2">
    <h3 className="text-3xl mb-4">{title}</h3>
    
    {fetched && data.length === 0
      ? <div className="py-12 flex flex-col justify-center items-center"> 
          <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
          <h3 className="text-xl mt-6">No Data Available.</h3>
        </div>
      : data.length === 0 
          ? <div className="py-12 flex flex-col justify-center items-center">
              <i className="fa fa-spinner fa-spin text-6xl"></i>
              <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
            </div>
          : <PaginatedTable data={data} />
    }
  </div>)
};

export default SimpleTableCard;

