import React, {useState, useEffect} from 'react';
import apiService from '../../services/api';
import numeral from "numeral";

import change_arrow_down from "../../assets/change_arrow_down.png";
import change_arrow_up from "../../assets/change_arrow_up.png";

const AircraftFlightHistory = ({ regNumbers }) => {

  const processFlightHistory = (dataObject) => {
    console.log(dataObject)
    let entries = [];
  
    let totalHours = 0;
    let totalDistance = 0;
    let yearsWithValues = [];
  
    // Step 1: Parse the Data
    Object.entries(dataObject).forEach(([year, months]) => {
        Object.entries(months).forEach(([month, data]) => {
            entries.push({ year, month, data });
            totalHours += data.hours;
            totalDistance += data.distance;
  
            if (data.hours > 0 && !yearsWithValues.includes(year)) {
              yearsWithValues.push(year);
            }
        });
    });
  
    // Calculate average distance and hours across all years
    let averageDistance = totalDistance / entries.length;
    let averageHours = totalHours / yearsWithValues.length;
  
    const averages = {
      averageDistance: averageDistance,
      averageAnnualDuration: averageHours
    }
  
    // Sort by year and month to ensure correct order
    entries.sort((a, b) => {
        return a.year === b.year ? a.month - b.month : a.year - b.year;
    });
  
    // Step 2: Find Most Recent Data
    const mostRecentEntry = entries[entries.length - 1];
  
    // Step 3: Calculate Data for Last 12 Months
    const last12entries = entries.slice(-12);
    const previous12entries = entries.slice(-24, -12);
  
    const last30days = {
      flights: mostRecentEntry.data.flights,
      hours: mostRecentEntry.data.hours,
      averageLength: mostRecentEntry.data.hours / mostRecentEntry.data.flights,
      change: mostRecentEntry.data.flights / entries[entries.length - 2].data.flights
    };
  
    const flightsThisYear = last12entries.reduce((acc, entry) => acc + entry.data.flights, 0);
    const hoursThisYear = last12entries.reduce((acc, entry) => acc + entry.data.hours, 0);
    const averageLengthThisYear = hoursThisYear / flightsThisYear;
  
    const last12Months = {
      flights: flightsThisYear,
      hours: hoursThisYear,
      averageLength: averageLengthThisYear,
      change: flightsThisYear / previous12entries.reduce((acc, entry) => acc + entry.data.flights, 0)
    }
  
    return { last30days, last12Months, averages };
  };

  const [processedHistory, setProcessedHistory] = useState({});
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    async function fetchData() {
      //console.log("Fetching aircraft flight history for reg=" + regNumbers)
      if (regNumbers == "reg=") {
        setFetching(false);
        return;
      }
      setFetching(true);
      const last12Months = await apiService.getLast12MonthsFlights("reg=" + regNumbers);
      console.log(last12Months.data)
      setProcessedHistory(processFlightHistory(last12Months.data));
      setFetching(false);
    }
    
    fetchData();
  }, [regNumbers]);

  return (
    <div className="card">
      <div className="w-full">
        {fetching
          ? <div className="py-24 flex flex-col justify-center items-center">
              <i className="fa fa-spinner fa-spin text-6xl"></i>
              <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
            </div>
          : Object.keys(processedHistory).length === 0 
            ? <div className="py-24 flex flex-col justify-center items-center">
                <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
                <h3 className="text-xl mt-6">No Data Available.</h3>
              </div>
            : <>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-xl">Activity Past 30 Days</h4>
                  <div style={{minWidth: 85}} className={`change ${processedHistory.last30days.change >= 0 ? "positiveChange" : "negativeChange"}`}>
                    {numeral(processedHistory.last30days.change).format("0,0.0")}%
                    {processedHistory.last30days.change !== 0 && <img src={processedHistory.last30days.change < 0 ? change_arrow_down : change_arrow_up} alt="" />}
                  </div>
                </div>
                <div 
                  className="bg-[#28ace2] h-6 rounded-r-2xl text-white px-2 py-1 flex items-center justify-end"
                  style={{width: processedHistory.last30days.flights === 0 ? 0 : (processedHistory.last30days.flights / processedHistory.last30days.hours * 100 + "%"), minWidth: (40 + "%")}}
                >
                  <span>{numeral(processedHistory.last30days.flights).format("0,0")} flights</span>
                </div>
                <div 
                  className="bg-[#FF8A00] h-6 rounded-r-2xl text-white px-2 py-1 flex items-center justify-end"
                  style={{width: processedHistory.last30days.hours === 0 ? 0 : 100, minWidth: (40 + "%")}}
                >
                  <span>{numeral(processedHistory.last30days.hours).format("0,0")} hours</span>
                </div>
                <div 
                  className="bg-[#03B15E] h-6 rounded-r-2xl text-white px-2 py-1 flex items-center justify-end"
                  style={{width: processedHistory.last30days.hours === 0 ? 0 : ((processedHistory.last30days.hours / processedHistory.last30days.flights) / processedHistory.last30days.hours * 100 + "%"), minWidth: 120}}
                >
                  <span>{numeral(processedHistory.last30days.hours / processedHistory.last30days.flights).format("0,0.00")} hours</span>
                </div>

                <div className="flex items-center gap-2 mb-2 mt-4">
                  <h4 className="text-xl">Activity This Year</h4>
                  <div style={{minWidth: 85}} className={`change ${processedHistory.last12Months.change >= 0 ? "positiveChange" : "negativeChange"}`}>
                    {numeral(processedHistory.last12Months.change).format("0,0.0")}%
                    {processedHistory.last12Months.change !== 0 && <img src={processedHistory.last12Months.change < 0 ? change_arrow_down : change_arrow_up} alt="" />}
                  </div>
                </div>
                <div 
                  className="bg-[#28ace2] h-6 rounded-r-2xl text-white px-2 py-1 flex items-center justify-end"
                  style={{width: (processedHistory.last12Months.flights / processedHistory.last12Months.hours * 100 + "%"), minWidth: (40 + "%")}}
                >
                  <span>{numeral(processedHistory.last12Months.flights).format("0,0")} flights</span>
                </div>
                <div className="bg-[#FF8A00] h-6 rounded-r-2xl text-white px-2 py-1 flex items-center justify-end w-00">
                  <span>{numeral(processedHistory.last12Months.hours).format("0,0")} hours</span>
                </div>
                <div 
                  className="bg-[#03B15E] h-6 rounded-r-2xl text-white px-2 py-1 flex items-center justify-end"
                  style={{width: ((processedHistory.last12Months.hours / processedHistory.last12Months.flights) / processedHistory.last12Months.hours * 100 + "%"), minWidth: 120}}
                >
                  <span>{numeral(processedHistory.last12Months.hours / processedHistory.last12Months.flights).format("0,0.00")} hours</span>
                </div>
                <div className="w-full flex items-center flex-wrap justify-center mt-6" style={{gap: "0rem 1rem"}}>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-3 bg-[#28ace2] w-6"></div>
                    <span>Total Movements</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-3 bg-[#FF8A00] w-6"></div>
                    <span>Total Flight Hours</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-3 bg-[#03B15E] w-6"></div>
                    <span>Average Mission Length</span>
                  </div>
                </div>
              </>
        }
      </div>
    </div>
  );
}

export default AircraftFlightHistory;