import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, LabelList, Tooltip, Line, LineChart, ResponsiveContainer } from 'recharts';
import apiService from '../../services/api';

const CustomBar = (props) => {
  const { fill, x, y, width, height } = props;
  const radius = 5;
  const spacing = 5;
  const adjustedHeight = height - spacing;
  const adjustedY = y + spacing / 2;

  const path = `
    M ${x + radius},${adjustedY} 
    h ${width - 2 * radius} 
    a ${radius},${radius} 0 0 1 ${radius},${radius} 
    v ${adjustedHeight - 2 * radius} 
    a ${radius},${radius} 0 0 1 -${radius},${radius} 
    h -${width - 2 * radius} 
    a ${radius},${radius} 0 0 1 -${radius},-${radius} 
    v -${adjustedHeight - 2 * radius} 
    a ${radius},${radius} 0 0 1 ${radius},-${radius}
    Z`;

  return <path d={path} fill={fill} />;
};

const ActivityByTypeCard = () => {
  const [year, setYear] = useState(2023);
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [fetching, setFetching] = useState(false);
  const toggleChartType = () => setChartType(chartType === "bar" ? "line" : "bar");

  useEffect(() => {
    async function fetchData() {
      setFetching(true);
      const response = await apiService.getFlightsByMonthByYear({ year });
      console.log(response)
      // If chart type is line, transform data to set name to be first 3 letters of month
      if (chartType === "line") {
        const transformedData = response.data.map((monthData) => {
          const monthName = monthData.name.slice(0, 3);
          return { ...monthData, name: monthName };
        });
        setData(transformedData);
      } else {
        setData(response.data);
      }
      setFetching(false);
    }
    fetchData();
  }, [year]);

  const yearSelector = () => {
    const years = [2019, 2020, 2021, 2022, 2023, 2024];
  
    const handleSelectChange = (event) => {
      setYear(parseInt(event.target.value, 10));
    }
  
    return (
      <div className="interact_button md:ml-auto cursor-pointer">
        <i className="fa-solid fa-calendar"></i>
        <select value={year} onChange={handleSelectChange}>
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex items-center justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex gap-2 items-center">
          <div className="h-3 w-6" style={{ backgroundColor: entry.color }}></div>
          <h4>{entry.value}</h4>
        </div>
      ))}
    </div>
  );

  const renderCustomBarLabel = ({ x, y, width, value }) => {
    return (
      <text x={x + width / 2} y={y} fill="#000" textAnchor="middle" dy={-6}>
        {value}
      </text>
    );
  };  

  return (
  <div className="card activity-by-type-card flex-grow flex flex-col">
    <div className="flex flex-col md:flex-row md:justify-center gap-4 mb-8">
      <h3>Activity by Type</h3>
      
      {yearSelector()}

      <div className="interact_button" onClick={toggleChartType}>
        {chartType === "bar" ? <i className="fa-solid fa-chart-line"></i> : <i className="fa-solid fa-chart-column"></i>}
        <p>Switch Graph</p>
      </div>
    </div>

    {fetching && 
      <div className="py-24 flex flex-col justify-center items-center">
        <i className="fa fa-spinner fa-spin text-6xl"></i>
        <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
      </div>
    }

    {!fetching && (
      Object.keys(data).length === 0
      ? <div className="py-24 flex flex-col justify-center items-center">
          <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
          <h3 className="text-xl mt-6">No Data Available.</h3>
        </div>
      :  
        chartType === "bar"
          ? <>
              <div className="flex-grow overflow-x-scroll">
                <div className="w-[300%] h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 35, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: "Flights", angle: -90, position: 'insideLeft' }} />
                    <Tooltip cursor={false} />
                    <Bar dataKey="Light" stackId="a" fill="#867DF4" shape={<CustomBar />} />
                    <Bar dataKey="Medium" stackId="a" fill="#5D94F7" shape={<CustomBar />} />
                    <Bar dataKey="Large" stackId="a" fill="#5DC5C2" shape={<CustomBar />}>
                      <LabelList dataKey="total" content={renderCustomBarLabel} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </div>
              <CustomLegend payload={[
                { value: 'Light', color: '#867DF4' },
                { value: 'Medium', color: '#5D94F7' },
                { value: 'Large', color: '#5DC5C2' }
              ]}/>
            </>
          : <>
              <div className="h-full min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: '10px' }} />
                    <YAxis label={{ value: "Flights", angle: -90, position: 'insideLeft' }} />
                    <Tooltip  />
                    <Line type="monotone" dataKey="Light" stroke="#867DF4" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="Medium" stroke="#5D94F7" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="Large" stroke="#5DC5C2" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <CustomLegend payload={[
                { value: 'Light', color: '#867DF4' },
                { value: 'Medium', color: '#5D94F7' },
                { value: 'Large', color: '#5DC5C2' }
              ]}/>
            </>
    )}
  </div>
  )
};
  
export default ActivityByTypeCard;