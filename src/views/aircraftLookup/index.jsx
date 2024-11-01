import React, { useState, useEffect, } from "react";
import { useSearchParams } from "react-router-dom";
import apiService from "../../services/api";
import numeral from "numeral";

import FlightActivityCard from "../../components/aircraftLookup/activityByTypeCard";

import AircraftFlightHistory from "../../components/shared/aircraftFlightHistory";
import HealthScoreCard from "../../components/shared/healthScoreCard/index";
import FlightsByAirport from "../../components/dashboard/flightsByAirport";
import SimpleTableCard from "../../components/shared/simpleTableCard";
import BasicRowsCard from "../../components/shared/basicRowsCard";
import InsightsCard from "../../components/shared/insightsCard";
import DonutChartCard from "../../components/shared/donutCard";
import TopRoutes from "../../components/shared/topRoutes";

import change_arrow_up from "../../assets/change_arrow_up.png";
import change_arrow_down from "../../assets/change_arrow_down.png";

import { getCountryFromRegistration } from "../../utils/constants/app-constants";
import useGetAircraftHealth from "../../custom-hooks/useGetAircraftHealth";
export default function AircraftLookup() {
  const [searchParams] = useSearchParams();
  const reg = searchParams.get("reg");
  const [regNumber, setRegNumber] = useState(reg ? reg : "");
  const [foundMatch, setFoundMatch] = useState(false);
  const [aircraftData, setAircraftData] = useState({});
  const [serialNumber, setSerialNumber] = useState("");
  const [sCode, setSCode] = useState("");
  const [year, setYear] = useState("-");
  const [acquisitionValues, setAcquisitionValues] = useState("");
  const [marketValue, setMarketValue] = useState(0);
  const [airportData, setAirportData] = useState([]);
  const [hasDoneLookup, setHasDoneLookup] = useState(false);
  const [lookupInProgress, setLookupInProgress] = useState(false);
  const [fleetRegNumbers, setFleetRegNumbers] = useState("");
  const [annualHoursVsFleet, setAnnualHoursVsFleet] = useState(null);
  const health = useGetAircraftHealth({serialNumber})

  useEffect(() => {
    async function fetchData() {
      setAircraftData({});
      if (regNumber.length < 6 || regNumber.length > 8) {
        setLookupInProgress(false)
        setHasDoneLookup(false);
        setFoundMatch(false);
        return;
      }
      setHasDoneLookup(true);
      setLookupInProgress(true);
      const response = await apiService.lookupAircraft(regNumber);
      
      console.log(response)
      if (response.message === "Invalid registration number") {
        setLookupInProgress(false)
        setFoundMatch(false);
        return;
      }
      if (Object.keys(response).length > 0) {

        const fetchAircraftData = await apiService.getAircrafts(`exact_name=${encodeURIComponent(response.aircraft)}`);
        //console.log(fetchAircraftData)
        if (fetchAircraftData.data.length > 0) {
          setAirportData(response.airports.sort((a, b) => b.times_visited - a.times_visited));
          setSerialNumber(response.serial_no);
          setSCode(response.sCode)
          let data = fetchAircraftData.data[0];
          //console.log(data)
          setAircraftData(data);
          setYear(data.production_start)
          setAcquisitionValues(data.acquisition_values);
          setFoundMatch(true);
        }
      };
      setLookupInProgress(false);
    }
    fetchData();
  }, [regNumber]);

  useEffect(() => {
    async function fetchData() {
      const regNumbers = await apiService.getRegNumbersForAircraft("make=" + aircraftData.aircraft_manufacturer + "&model=" + aircraftData.model);
      //console.log(regNumbers)
      if (regNumbers.data.length > 0) setFleetRegNumbers(regNumbers.data.join("&reg="));
    }
    if (aircraftData.aircraft_manufacturer && aircraftData.model) fetchData();
  }, [aircraftData]);

  function getAcquisitionValueOrAverage(acquisitionValues, year) {
    const valuesObj = JSON.parse(acquisitionValues);

    if (valuesObj.hasOwnProperty(year.toString())) {
      return valuesObj[year];
    }

    let total = 0;
    let count = 0;
    for (let key in valuesObj) {
      if (valuesObj.hasOwnProperty(key)) {
        total += valuesObj[key];
        count++;
      }
    }

    return count > 0 ? total / count : 0;
  }

  useEffect(() => {
    const contentContainer = document.getElementById('content-container');
    if (contentContainer) contentContainer.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!acquisitionValues || !year) return;
    setMarketValue(getAcquisitionValueOrAverage(acquisitionValues, year));
  }, [year, acquisitionValues]);

  return (
  <div className="w-100 py-8 px-4 md:px-8 flex flex-col md:gap-6 gap-8">
    <div className="flex flex-col items-center py-12 gap-6">
      <h2 className="text-center text-3xl md:text-4xl font-bold">Enter registration number of aircraft</h2>
      <input 
        value={regNumber} 
        onChange={(e) => setRegNumber(e.target.value.toUpperCase().replace("/", ""))} 
        className="aircraft_lookup_input" 
        type="text" 
        placeholder="N898TS" 
      />

    </div>

    {lookupInProgress && (
        <div className="w-full py-12 flex flex-col justify-center items-center">
          <i className="fa fa-spinner fa-spin text-6xl"></i>
          <h3 className="text-xl mt-6">Fetching  aircraft data...</h3>
        </div>
    )}

    {!foundMatch && !lookupInProgress && hasDoneLookup && (
      <div className="w-full py-12 flex flex-col justify-center items-center"> 
        <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
        <h3 className="text-xl mt-6">Invalid Registration Number.</h3>
      </div>
    )}

    {foundMatch && !lookupInProgress && (
    <>
      <div className="grid md:grid-cols-3 md:gap-6 gap-8">

        <BasicRowsCard 
          titleOne="Aircraft Type" contentOne={aircraftData.aircraft_name}
          titleTwo="Country" contentTwo={getCountryFromRegistration(regNumber)}
          titleThree="Serial Number" contentThree={serialNumber}
          titleFour="Year" contentFour={aircraftData.production_start}
        />

        <AircraftFlightHistory regNumbers={regNumber} />

        <BasicRowsCard 
          titleOne="Charter Aircraft" contentOne={aircraftData.estimated_hourly_charter > 0 ? "Yes" : "No"}
          titleTwo="Hours Vs Fleet" contentTwo={!annualHoursVsFleet ? "N/A" : <>
            <div className={`${annualHoursVsFleet >= 0 ? "positiveChange" : "negativeChange"} change`}>
              {numeral(annualHoursVsFleet).format("0,0.0")}%
              {annualHoursVsFleet !== 0 && <img src={annualHoursVsFleet < 0 ? change_arrow_down : change_arrow_up} alt="" />}
            </div>
          </>}
         
          titleThree="Market Value" contentThree={`$${numeral(marketValue).format("0,0")}`}
          titleFour="Annual Operating Cost" contentFour={`$${numeral(aircraftData.NA_annual_total).format("0,0")}`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        <HealthScoreCard
          donutOneTitle="Overall score" donutOnePercent={health.health_score}
          donutTwoTitle="Hours score" donutTwoPercent={health.hours_score}
          donutThreeTitle="Transactions" donutThreePercent={health.transaction_score}
          donutFourTitle="Accidents" donutFourPercent={health.accident_score}
          alertOneType="positive" alertOneContent="Aircraft hours occur regularly with no significant down periods"
          alertTwoType="alert" alertTwoContent="Aircraft has been flown to airports with suspicious links "
          alertThreeType="warning" alertThreeContent="Aircraft has an accident recorded as a fatality and total loss"
          displayTextArea={false}
        />

        <InsightsCard ai_endpoint={`ai-aircraft-lookup/${regNumber}/`} defaultText={'What are some anomalies with the flight activity of this aircraft? Is it a good investment? Should I be concerned about anything I see about it?'}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 md:gap-8">
        <div className="col-span-2 mb-6 md:mb-0">
          <FlightActivityCard fleetRegNumbers={fleetRegNumbers} regNumber={regNumber} setAnnualHoursVsFleet={setAnnualHoursVsFleet} />
        </div>

        <DonutChartCard
          title="Departures by Region"
          apiRoute="getFlightsByContinent"
          additionalApiFilters={`reg=${regNumber}`}
        />
      </div>

      <TopRoutes
        presetFilters={`reg=${regNumber}`}
      />

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <SimpleTableCard
          title="Recent Transactions"
          apiRoute="getRegistrations"
          additionalApiFilters={`sCode=${sCode}`}
          timePeriod={30}
        />

        <div className="flex-grow">
          <SimpleTableCard
            title="Recent Accidents"
            apiRoute="getAccidents"
            additionalApiFilters={`reg=${regNumber}`}
            timePeriod={30}
          />
        </div>
      </div>

      <FlightsByAirport presetData={airportData} presetFilters={"reg=" + regNumber} yearOnYearOverride={true} />
    </>
    )}
  </div>
  );
}