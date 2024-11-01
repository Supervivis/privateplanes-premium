import React, {useState, useEffect} from "react";
import apiService from "../../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ChartFilters from "./chartFilters";
import numeral from 'numeral';
import { FORMAT_DATE } from "../../utils/constants/app-constants";

//const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const transformData = (data) => {
  let transformedData = months.map((monthName, index) => {
    let monthData = { name: monthName };
    for (const year in data) {
      monthData[year] = data[year][index + 1] || 0;
    }
    return monthData;
  });
  return transformedData;
};

const transform30DaysData = (data) => {
  let transformedData = [];
  for (let i = 0; i < 30; i++) {
    let dateParts = data[i].date.replace(/-/g, "/").split("/");
    let preFormatDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
    transformedData.push({ name:FORMAT_DATE(preFormatDate, true), Missions: data[i].totalFlights });
  }
  return transformedData;
};

const typeApiMethods = {
  "Missions": "getFlightHistory",
  "Hours": "getFlightHoursHistory",
  "Distance": "getFlightDistanceHistory",
  "Calendar": "getFlightHistory"
};

const FlightHistoryCard = () => {
  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState("Missions");
  const [apiFilters, setApiFilters] = useState("");
  const [highestMonth, setHighestMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2023);
  const [fetching, setFetching] = useState(false);
  const [past30Days, setPast30Days] = useState(false);
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
    async function fetchData() {
      (chartType !== "Missions" && past30Days) && setPast30Days(false);

      setData([]);
      setFetching(true);
      const response = await apiService[typeApiMethods[chartType]](apiFilters + (past30Days ? "&past30Days=true" : ""));
      //console.log(response);

      if (chartType === "Missions" && past30Days) {
        setData(transform30DaysData(response.data));
        //console.log(transform30DaysData(response.data))
      }
      else {
        setRawData(response.data);
        setData(transformData(response.data));
        console.log(transformData(response.data))
      }

      setFetching(false);
    }
    fetchData();
  }, [chartType, apiFilters, past30Days]);

  useEffect(() => {
    if (Object.keys(rawData).length > 0 && chartType === "Calendar") {
      setHighestMonth(Math.max(...Object.values(rawData[selectedYear])));
    }
  }, [rawData, selectedYear, chartType])

  const chartTypeSelector = () => {
    const charts = ["Missions", "Hours", "Distance", "Calendar"];
  
    const handleSelectChange = (event) => {
      setChartType(event.target.value);
    }
  
    return (
      <div className={`${chartType !== "Missions" && "md:ml-auto"} interact_button cursor-pointer`}>
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
  <div className="card">
    <div className="flex flex-col md:flex-row gap-4 md:items-center mb-8">
      <h3>Flight History</h3>

      {chartType === "Missions" && (past30Days
        ? <button className="interact_button md:ml-auto" onClick={() => setPast30Days(false)}><i class="fa-solid fa-calendar"></i>&nbsp;Annual</button>
        : <button className="interact_button md:ml-auto" onClick={() => setPast30Days(true)}><i class="fa-solid fa-clock-rotate-left"></i>&nbsp;Past 30 Days</button>)
      }
      {chartTypeSelector()}

      <ChartFilters setApiFilters={setApiFilters} />
    </div>

    {fetching && 
      <div className="py-24 flex flex-col justify-center items-center">
        <i className="fa fa-spinner fa-spin text-6xl"></i>
        <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
      </div>
    }

    <div className="map-container">
    {!fetching && (
      Object.keys(rawData).length === 0
      ? <div className="py-24 flex flex-col justify-center items-center">
          <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
          <h3 className="text-xl mt-6">No Data Available.</h3>
        </div>
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
                data={data}
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

                {(chartType === "Missions" && past30Days)
                  ? <Line type="monotone" dataKey="Missions" stroke="#8884d8" dot={false} strokeWidth={2} />
                    : Object.entries(years).map(([year, value]) => (
                      value.display && <Line type="monotone" dataKey={year} stroke={value.stroke} dot={false} strokeWidth={2} key={year} />
                    ))
                }
              </LineChart>
            </ResponsiveContainer>

            {!past30Days && 
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
            }
          </>
    )}
    </div>

  </div>
  )
};
  
export default FlightHistoryCard;