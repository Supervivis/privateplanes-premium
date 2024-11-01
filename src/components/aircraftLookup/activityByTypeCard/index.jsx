import React , { useEffect, useState } from 'react';
import apiService from '../../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import numeral from 'numeral';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const transformData = (data) => {
  let transformedData = months.map((monthName, index) => {
    let monthData = { name: monthName };
    for (const year in data) {
      // The month index starts from 1 in your data, so we add 1 to the zero-based index
      monthData[year] = data[year][index + 1] || 0;
    }
    return monthData;
  });
  return transformedData;
};

const CustomBar = (props) => {
  const { fill, x, y, width, height } = props;
  const topRadius = 15;

  const path = `
    M ${x},${y + topRadius} 
    a ${topRadius},${topRadius} 0 0 1 ${topRadius},-${topRadius}
    h ${width - 2 * topRadius} 
    a ${topRadius},${topRadius} 0 0 1 ${topRadius},${topRadius}
    v ${height - topRadius} 
    h -${width} 
    Z`;

  return <path d={path} fill={fill} />;
};

const CustomBarLabel = (props) => {
  const { x, y, width, value } = props;
  const labelX = x + width / 2;
  const labelY = y + 40;

  return (
    <text x={labelX} y={labelY} fill="#fff" textAnchor="middle" dominantBaseline="middle" transform={`rotate(-90, ${labelX}, ${labelY})`}>
      {value}
    </text>
  );
};

const FlightActivityCard = ({ additionalClasses, regNumber, fleetRegNumbers, setAnnualHoursVsFleet }) => {
  const [chartType, setChartType] = useState("Versus Fleet");
  const [chartData, setChartData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [highestMonth, setHighestMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2023);
  const [fetching, setFetching] = useState(false);
  const [years, setYears] = useState({
    "2019": {
      display: true,
      stroke: "#8884d8"
    },
    "2020": {
      display: true,
      stroke: "#CE2A96"
    },
    "2021": {
      display: true,
      stroke: "#106CC2"
    },
    "2022": {
      display: true,
      stroke: "#FF8660"
    },
    "2023": {
      display: true,
      stroke: "#04BF00"
    },
    "2024": {
      display: true,
      stroke: "#930101"
    },
  });

  useEffect(() => {
    async function fetchFleetData() {
      setFetching(true);
      let response = await apiService.getFleetActivity(`reg=${fleetRegNumbers}`);
      console.log(response);
      if (response.length > 0) {
        let aircraftsInFleet = response.length / 12;
        let fleetMonthlyData = [];
        let aircraftMonthlyData = [];
        let annualFlightHours = {aircraft: 0, fleet: 0};
    
        for (let i = 0; i < response.length; i++) {
          if (response[i].registration === regNumber) {
            aircraftMonthlyData[response[i].month] = {
              flights: response[i].flights,
              duration: response[i].duration
            }
            annualFlightHours.aircraft += response[i].duration;
          }
          
          if (fleetMonthlyData[response[i].month]) {
            fleetMonthlyData[response[i].month] = {
              flights: fleetMonthlyData[response[i].month].flights + response[i].flights,
              duration: fleetMonthlyData[response[i].month].duration + response[i].duration
            }
            annualFlightHours.fleet += response[i].duration;
          }
          else {
            fleetMonthlyData[response[i].month] = {
              flights: response[i].flights,
              duration: response[i].duration
            }
            annualFlightHours.fleet += response[i].duration;
          }
        }
    
        let dataForChart = [];
        let averageFleetAnnualHours = annualFlightHours.fleet / aircraftsInFleet;
        console.log(annualFlightHours.aircraft, averageFleetAnnualHours);
        setAnnualHoursVsFleet((annualFlightHours.aircraft === 0 ? "N/A" : annualFlightHours.aircraft / averageFleetAnnualHours * 100) - 100);
        for (let i = 0; i < 12; i++) {
          dataForChart.push({
            "name": months[i],
            "Fleet Average Movements": fleetMonthlyData[i + 1] ? (fleetMonthlyData[i + 1].flights / aircraftsInFleet).toFixed(1) : 0,
            [`${regNumber} Movements`]: aircraftMonthlyData[i + 1] ? aircraftMonthlyData[i + 1].flights : 0,
            "Fleet Average Hours": fleetMonthlyData[i + 1] ? (fleetMonthlyData[i + 1].duration / aircraftsInFleet).toFixed(1) : 0,
            [`${regNumber} Hours`]: aircraftMonthlyData[i + 1] ? aircraftMonthlyData[i + 1].duration : 0
          });
        }
    
        setChartData(dataForChart);
      }
      setFetching(false);
    }

    async function fetchTypeData() {
      setFetching(true);
      const response = await apiService[typeApiMethods[chartType]]("reg=" + regNumber);
      console.log(response);
      setRawData(response.data);
      setChartData(transformData(response.data));
      setFetching(false);
    }
    
    if (chartType === "Versus Fleet") {
      fetchFleetData();
    } 
    else fetchTypeData()
  }, [chartType, fleetRegNumbers, regNumber]);

  useEffect(() => {
    if (Object.keys(rawData).length > 0 && chartType === "Calendar") {
      setHighestMonth(Math.max(...Object.values(rawData[selectedYear])));
    }
  }, [rawData, selectedYear, chartType])

  const typeApiMethods = {
    "Hours": "getFlightHoursHistory",
    "Distance": "getFlightDistanceHistory",
    "Calendar": "getFlightHistory"
  };

  const chartTypeSelector = () => {
    const charts = ["Versus Fleet", "Hours", "Distance", "Calendar"];
  
    const handleSelectChange = (event) => {
      setChartType(event.target.value);
    }
  
    return (
      <div className="interact_button md:ml-auto cursor-pointer">
        <i className="fa-solid fa-chart-line"></i>
        <select value={chartType} onChange={handleSelectChange}>
          {charts.map((chartOption) => (
            <option key={chartOption} value={chartOption}>
              {chartOption}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderCalendarMonth = (month, index) => {
    let monthColor;

    if (month === 0) monthColor = "linear-gradient(180deg, #F23B2F 0%, rgba(242, 59, 47, 0) 248.1%)";
    else {
      const monthPercentage = Math.round((month / highestMonth) * 100);
      if (monthPercentage < 75) monthColor = "linear-gradient(180deg, #F23B2F 0%, rgba(242, 59, 47, 0) 248.1%)"
      else if (monthPercentage >= 75 && monthPercentage < 85) monthColor = "linear-gradient(181.36deg, #FF9B00 1.16%, rgba(255, 155, 0, 0) 188.53%)"
      else monthColor = "linear-gradient(180deg, #48E200 0%, rgba(72, 226, 0, 0) 196.84%)";
    }
    //console.log(month, index, monthPercentage, highestMonth)
    return (
      <div key={index} className="flex flex-col gap-2 items-center justify-center py-4 md:py-8 rounded-2xl calendar-item" style={{background: monthColor}}>
        <h3 className="text-xl">{months[index]}</h3>
        <p>{month} Flights</p>
      </div>
    )
  };

  return (
  <div className={`card flex-grow ${additionalClasses} ${Object.keys(chartData).length === 0 && "h-full"}`}>
    <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-8">
      <h3>Flight Activity</h3>

      {chartTypeSelector()}
    </div>

    {fetching &&  
      <div className="py-24 flex flex-col justify-center items-center">
        <i className="fa fa-spinner fa-spin text-6xl"></i>
        <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
      </div>
    }
  
    {!fetching && (
      Object.keys(chartData).length === 0
        ? <div className="py-24 flex flex-col justify-center items-center">
            <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
            <h3 className="text-xl mt-6">No Data Available.</h3>
          </div>
        : <>
            {chartType === "Versus Fleet" 
              ? <>
                <div className="overflow-scroll">
                  <ResponsiveContainer width="300%" height={400}>
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => numeral(value).format("0,0")}  />
                      <Bar dataKey="Fleet Average Movements" fill="#5DC5C2" shape={<CustomBar />} label={<CustomBarLabel />} />
                      <Bar dataKey={`${regNumber} Movements`} fill="#5247C6" shape={<CustomBar />} label={<CustomBarLabel />} />
                      <Bar dataKey="Fleet Average Hours" fill="#8DE6E6" shape={<CustomBar />} label={<CustomBarLabel />} />
                      <Bar dataKey={`${regNumber} Hours`} fill="#867DF4" shape={<CustomBar />} label={<CustomBarLabel />} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-6" style={{ backgroundColor: "#5DC5C2" }}></div>
                      <h4>Fleet Average Movements</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-6" style={{ backgroundColor: "#5247C6" }}></div>
                      <h4>{regNumber} Movements</h4>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-6" style={{ backgroundColor: "#8DE6E6" }}></div>
                      <h4>Fleet Average Hours</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-6" style={{ backgroundColor: "#867DF4" }}></div>
                      <h4>{regNumber} Hours</h4>
                    </div>
                  </div>
                </div>
                </>
              : chartType === "Calendar"
                  ? <>
                    <div className="items-center flex mb-4 gap-2">
                      <h3 className="text-2xl mr-auto">{selectedYear}</h3>
                      <button disabled={selectedYear === 2019} className="border-2 rounded-md py-1 px-2" onClick={() => setSelectedYear(selectedYear - 1)}><i className="fa-solid fa-angles-left"></i></button>
                      <button disabled={selectedYear === 2023} className="border-2 rounded-md py-1 px-2" onClick={() => setSelectedYear(selectedYear + 1)}><i className="fa-solid fa-angles-right"></i></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      {Object.entries(rawData[selectedYear]).map(([month, value], index) => (
                        renderCalendarMonth(value, index)
                      ))}
                    </div>
                    </>
                  : <>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          data={chartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <XAxis dataKey="name" tick={{ fontSize: '10px' }} />
                          <YAxis label={{ value: chartType === "Distance" ? `${chartType} (NM in thousands)` : chartType, angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle' } }} tickFormatter={(value) => `${value > 9999 ? `${value / 1000}k` : value}`} />
                          <Tooltip formatter={(value) => numeral(value).format("0,0")}  />
          
                          {Object.entries(years).map(([year, value]) => (
                            value.display && <Line type="monotone" dataKey={year} stroke={value.stroke} dot={false} strokeWidth={2} key={year} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-4 mt-4 justify-center items-center">
                        {Object.entries(years).map(([year, value]) => (
                          <div 
                            key={year} 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setYears({...years, [year]: {...years[year], display: !years[year].display}})}
                          >
                            <div className="w-6 h-4 border" style={value.display ? { backgroundColor: value.stroke, borderColor: value.stroke } : {borderColor: value.stroke}}></div>
                            <p>{year}</p>
                          </div>
                        ))}
                      </div>
                    </>
            }
          </>
      )
    }
  </div>
  )
};
  
export default FlightActivityCard;