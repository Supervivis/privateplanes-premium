import React, {useState, useEffect} from "react";
import apiService from "../../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import numeral from 'numeral';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatYearOnYearData = (data, icaoCode) => {
  let chartData = [];

  // Split data into two arrays, one for the most recent 12 months, and one for the previous 12 months
  let recent12MonthsData = data.slice(0, 12);
  let previous12MonthsData = data.slice(12, 24);
  //console.log(recent12MonthsData, previous12MonthsData)

  for (let i = 0; i < 12; i++) {
    let flightsRecentMonth = 0;
    let flightsPreviousMonth = 0
    console.log(recent12MonthsData[i], previous12MonthsData[i]);

    for (const movement in recent12MonthsData[i].airportMovements) {
      let movementData = recent12MonthsData[i].airportMovements[movement];
      movementData.icaoCode == icaoCode && (flightsRecentMonth += movementData.movements)
    }

    for (const movement in previous12MonthsData[i].airportMovements) {
      let movementData = previous12MonthsData[i].airportMovements[movement];
      movementData.icaoCode == icaoCode && (flightsPreviousMonth += movementData.movements)
    }

    chartData.push({
      date: months[recent12MonthsData[i].month - 1],
      "This Year": flightsRecentMonth,
      "Last Year": flightsPreviousMonth
    });
  }
  console.log(chartData);
  return chartData ;
}

const MiniTableChart = ({ key, apiQuery, icao }) => {
  console.log(apiQuery, icao)
  const [chartData, setChartData] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!apiQuery) return;
      setFetching(true);

      if (icao) {
        const response = await apiService.getFlightsForPreviousYears(apiQuery);
        //console.log(response);
        let formattedData = formatYearOnYearData(response.data, icao);
        //console.log(formattedData);
        setChartData(formattedData);
      }
      else {
        const response = await apiService.getPrevious60DayFlights(apiQuery);
        console.log(response.data);
        const dataArray = Object.entries(response.data).map(([date, flights]) => ({ date, flights }));
        const formattedData = [];
        
        dataArray.reverse();

        for (let i = 0; i < 30; i++) {
          formattedData.push({
            name: "Day " + i,
            "Previous 30 Days": dataArray[i].flights,
            "Last 30 Days": dataArray[i + 30].flights
          });
        }

        setChartData(formattedData);
        console.log(formattedData);
      }

      setFetching(false);
    }
    fetchData();

  }, [apiQuery, icao]);

  return (
    <tr key={key} className="w-full">
      <td colSpan={10} className="w-full">
        {fetching
          ? <div className="w-full py-4 flex flex-col justify-center items-center">
            <i className="fa fa-spinner fa-spin text-4xl"></i>
            <h4 className="text-2xl mt-6">Loading Flight Activity...</h4>
          </div>
          : <div className="py-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => numeral(value).format("0,0")}  />
                  <Legend />
                  {icao 
                    ? <>
                        <Line type="monotone" dot={false} strokeWidth={2} stroke={"#04BF00"} dataKey="This Year" />
                        <Line type="monotone" dot={false} strokeWidth={2} stroke={"#4100AA"} dataKey="Last Year" />
                      </>
                    : <>
                        <Line type="monotone" dot={false} strokeWidth={2} stroke={"#04BF00"} dataKey="Last 30 Days" />
                        <Line type="monotone" dot={false} strokeWidth={2} stroke={"#4100AA"} dataKey="Previous 30 Days" />
                      </>
                  }
                  
                </LineChart>
              </ResponsiveContainer>
          </div>
        }
      </td>
    </tr>
  )
}

export default MiniTableChart;