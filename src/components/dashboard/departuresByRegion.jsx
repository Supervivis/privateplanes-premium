import React, {useEffect, useState} from 'react';
import apiService from '../../services/api';
import DonutChartCard from '../shared/donutCard';

const DeparturesByRegion = ({timePeriod}) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await apiService.getDeparturesByRegion(timePeriod);
      setData(data);
    }
    fetchData();
  }), [timePeriod];

  return (
    <div className="card flex flex-col gap-6">
      <h4 className="mb-4">Departures by Region</h4>

      {data 
        ? <DonutChartCard data={data} />
        : <p>Loading...</p>
      }
    </div>
  );
};

export default DeparturesByRegion;