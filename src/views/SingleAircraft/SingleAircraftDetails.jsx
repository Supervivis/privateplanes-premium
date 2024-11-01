import global from "../../components/styles/global.module.scss";

import numeral from "numeral";
import Axios from "axios";
import { ucFirst } from "../../utils/constants/app-constants";

import AircraftFlightHistory from "../../components/shared/aircraftFlightHistory";
import InsightsCard from "../../components/shared/insightsCard";
import SimpleTableCard from "../../components/shared/simpleTableCard";

import FleetHoursCard from "../../components/SingleAircraft/FleetHours";
import StatDonuts from "../../components/SingleAircraft/statDonuts";
import StatsWithDivider from "../../components/SingleAircraft/statsWithDivider";
import KeyFacts from "../../components/SingleAircraft/KeyFacts";
import PerformanceData from "../../components/SingleAircraft/PerformanceData";
import OwnershipCosts from "../../components/SingleAircraft/OwnershipCosts";
import Acquisition from "../../components/SingleAircraft/Acquisition";
import RangeMap from "../../components/SingleAircraft/RangeMap";
import Weights from "../../components/SingleAircraft/Weights";
import Similar from "../../components/SingleAircraft/Similar";
import AllAircraftCard from "../../components/SingleAircraft/allAircraftCard";

import ComparisonModal from "../../components/CompareAircrafts/comparisonModal";

import FlightsByAirport from "../../components/dashboard/flightsByAirport";

import apiService from "../../services/api";

import { useSearchParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import {
  REGION_OPTIONS,
  CURRENCY_OPTIONS,
  UNIT_OPTIONS,
} from "../../utils/constants/app-constants";
import Dropdown from "../../components/common/Dropdown";

export default function SingleAircraftDetails({ allowComparison = true }) {
  const [fetching, setFetching] = useState(false);
  const [aircraftData, setAircraftData] = useState([]);
  const [similarAircrafts, setSimilarAircrafts] = useState([]);
  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0]);
  const [region, setRegion] = useState(REGION_OPTIONS[0]);
  const [unit, setUnit] = useState(UNIT_OPTIONS[0]);
  const [nbHours, setNbHours] = useState(0);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [regNumbers, setRegNumbers] = useState([]);
  const [flightHistoryData, setFlightHistoryData] = useState([]);
  const [initiatedFollowUp, setInitiatedFollowUp] = useState(false);
  const [regionPrefix, setRegionPrefix] = useState("NA");
  const [conversionRate, setConversionRate] = useState(1);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [hasAttemptedHistoryFetch, setHasAttemptedHistoryFetch] = useState(false);
  const [showAllAircraft, setShowAllAircraft] = useState(false);
  const toggleShowAllAircraft = () => setShowAllAircraft(!showAllAircraft);

  useEffect(() => {
    setCurrencySymbol(currency === "USD" ? "$" : currency === "GBP" ? "£" : "€");

    if (currency !== "USD") {
      Axios.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd.json`)
      .then((res) => {
        setConversionRate(res[currency.toLowerCase()]);
      });
    }
  }, [currency]);

  useEffect(() => {
    if (region === "North America") {
      setRegionPrefix("NA");
    } else if (region === "South America") {
      setRegionPrefix("SA");
    } else if (region === "Europe") {
      setRegionPrefix("EU");
    } else {
      setRegionPrefix("AS");
    }
  }, [region]);

  const onCurrencyChanged = (val) => {
    setCurrency(val);
  };

  const onUnitChanged = (val) => {
    setUnit(val);
  };

  const onregionChanged = (val) => {
    setRegion(val);
  };

  const [distanceUnit, setDistanceUnit] = useState("m");
  const [weightUnit, setWeightUnit] = useState("kg");
  useEffect(() => { 
    unit === "Imperial Units" ? setDistanceUnit("ft") : setDistanceUnit("m");
    unit === "Imperial Units" ? setWeightUnit("lbs") : setWeightUnit("kg");
  }, [unit]);

  useEffect(() => {
    // Scroll the content-container to the top
    const contentContainer = document.getElementById('content-container');
    if (contentContainer) {
      contentContainer.scrollTo(0, 0);
    }

    async function fetchData() {
      if (!id) return;
      setFetching(true);
      const response = await apiService.getAircrafts("aircraftIds=" + id);
      if (response.data[0] && Object.keys(response.data[0]).length > 0) {
        setAircraftData(response.data[0]);
      }
      setFetching(false);
    }

    fetchData();
  }, [id]);

  useEffect(() => {
    async function fetchFollowUpData() {
      if (initiatedFollowUp || aircraftData.length === 0) return;
      if (aircraftData.length > 0 && !initiatedFollowUp) setInitiatedFollowUp(true);

      const similarItemsRequest = await apiService.getAircrafts("category=" + aircraftData.category);
      if (similarItemsRequest.data.length > 0) setSimilarAircrafts(similarItemsRequest.data);

      let regQuery = "make=" + aircraftData.aircraft_manufacturer + "&model=" + aircraftData.model;
      //console.log("Using regQuery", regQuery)

      const regNumbers = await apiService.getRegNumbersForAircraft(regQuery);
      //console.log(regNumbers)
      
      if (regNumbers.data.length > 0) {
        let regs = regNumbers.data.join("&reg=");
        setRegNumbers(regs);

        const flightHistory = await apiService.getFlightHoursHistory("reg=" + regs);
        console.log(flightHistory)
        setFlightHistoryData(flightHistory.data);
      }

      if (!hasAttemptedHistoryFetch) setHasAttemptedHistoryFetch(true);
    }

    fetchFollowUpData();
  }, [aircraftData, initiatedFollowUp]);

  return (
    <>
    {fetching && 
      <div className="h-screen flex flex-col justify-center items-center">
        <i className="fa fa-spinner fa-spin text-6xl"></i>
        <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
      </div>
    }

    {!fetching && (
      (Object.keys(aircraftData).length === 0)
      ? <div className="h-screen flex flex-col justify-center items-center">
          <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
          <h3 className="text-xl mt-6">No Data Available.</h3>
        </div>
      : <>
          <div className={styles.sorting + " " + global.pdf_hidden}>
            <div className={styles.dropdown}>
              <Dropdown
                className={styles.dropdown}
                headerDropdown={true}
                value={unit}
                setValue={(value) => onUnitChanged(value)}
                options={UNIT_OPTIONS}
              />
              <Dropdown
                className={styles.dropdown}
                headerDropdown={true}
                value={region}
                setValue={(value) => onregionChanged(value)}
                options={REGION_OPTIONS}
              />
              <Dropdown
                className={styles.dropdown}
                headerDropdown={true}
                value={currency}
                setValue={(value) => onCurrencyChanged(value)}
                options={CURRENCY_OPTIONS}
              />
              <ComparisonModal currentIds={[id]} />
            </div>
          </div>

          <KeyFacts params={aircraftData} />

          <div className="grid lg:grid-cols-3 md:gap-6 gap-8">
            <AircraftFlightHistory regNumbers={regNumbers} />

            <div className="col-span-2 h-full">
              <StatDonuts 
                params={aircraftData}
                currencySymbol={currencySymbol}
                regionPrefix={regionPrefix}
                conversionRate={conversionRate}
                unit={unit}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[60%] shrink-0">
              <FleetHoursCard preData={flightHistoryData} toggleShowAllAircraft={toggleShowAllAircraft} />
            </div>
            
            {showAllAircraft 
              ? <AllAircraftCard regNumbers={regNumbers} />
              : <InsightsCard ai_endpoint={`ai-aircraft-overview/${id}/`} defaultText={'Explain all the costs to me if I were to buy a 2012 example of this aircraft, fly it a total of 300 hours per year and then sell it in 3 years.'}/>
                
            } 
          </div>
          
          <OwnershipCosts
            params={aircraftData}
            currencySymbol={currencySymbol}
            region={region}
            conversionRate={conversionRate}
            setNbHoursProp={setNbHours}
          />

          <Acquisition
            params={aircraftData}
            conversionRate={conversionRate}
            currencySymbol={currencySymbol}
          />
          <RangeMap params={aircraftData} />

          <div className="grid lg:grid-cols-2 md:gap-6 gap-8">
            <div className="flex flex-col gap-6 md:gap-8">
              <PerformanceData params={aircraftData} unit={unit} />

              <div className="card">
                <h3 className="text-3xl">Features</h3>
                <StatsWithDivider
                  statOneTitle="Minimum Pilots" statOneContent={aircraftData.minimum_pilots}
                  statTwoTitle="Toilet Available" statTwoContent={aircraftData.toilet ? "Yes" : "No"}
                  statThreeTitle="Shower Available" statThreeContent={aircraftData.shower ? "Yes" : "No"}
                  statFourTitle="Space to Sleep" statFourContent={aircraftData.space_to_sleep ? "Yes" : "No"}

                  statFiveTitle="Typical Avionics Suite" statFiveContent={aircraftData.typical_avionic_suite}
                  statSixTitle="Flat Floor" statSixContent={aircraftData.flat_floor ? "Yes" : "No"}
                  statSevenTitle="Inflight Baggage Access" statSevenContent={aircraftData.baggage_access ? "Yes" : "No"}
                  statEightTitle="Dedicated Bedroom" statEightContent={aircraftData.dedicated_bed ? "Yes" : "No"}
                />
              </div>

              <div className="card">
                <h3 className="text-3xl">Interior</h3>
                <StatsWithDivider
                  statOneTitle="Maximum Passengers" statOneContent={aircraftData.max_pax}
                  statTwoTitle="Typical Passengers" statTwoContent={aircraftData.typical_pax}
                  statThreeTitle="Number of Living Zones" statThreeContent={aircraftData.living_zones}
                  statFourTitle="Cabin Noise (dB)" statFourContent={aircraftData.cabin_noise}

                  statFiveTitle="Max Cabin Altitude"
                  statFiveContent={`${numeral(aircraftData[`max_altitude_${unit === "Imperial Units" ? "feet" : "meters"}`]).format("0,0")} ${unit === "Imperial Units" ? "feet" : "meters"}`}

                  statSixTitle="Sea Level Cabin"
                  statSixContent={`${numeral(aircraftData.sea_level_cabin).format("0,0")} ${unit === "Imperial Units" ? "feet" : "meters"}`}

                  statSevenTitle="Pressure Differential" statSevenContent={`${aircraftData.pressure_differential_psi} PSI`}
                  statEightTitle="Cabin Volume" statEightContent={`${aircraftData[`cabin_volume_${unit === "Imperial Units" ? "CF" : "cubicmeters"}`]} cubic ${unit === "Imperial Units" ? "feet" : "meters"}`}
                />
              </div>

            </div>

            <div className="flex flex-col gap-6 md:gap-8">

              <div className="card">
                <h3 className="text-3xl">Powerplant</h3>

                <div className="flex flex-col md:items-center gap-8 mt-8">
                  <StatsWithDivider
                    statOneTitle="Engine Make" statOneContent={aircraftData.engine_manufacturer}
                    statTwoTitle={`Thrust per Engine (${weightUnit})`} statTwoContent={numeral(aircraftData[`thrust_output_${unit === "Imperial Units" ? "lbs" : "kgs"}`]).format("0,0")}

                    statFiveTitle="Engine Model" statFiveContent={aircraftData.engine_model}
                    statSixTitle={`Total Thrust Output (${weightUnit})`} statSixContent={numeral(aircraftData[`total_thrust_${unit === "Imperial Units" ? "lbs" : "kgs"}`]).format("0,0")}
                  />

                  <div className="flex flex-col justify-center text-center">
                    <h4 className="font-bold">Exterior Noise Levels (dB)</h4>

                    <div className="flex justify-center mt-6 gap-6">
                      <div>
                        <p className="font-bold">Lateral</p>
                        <p>{numeral(aircraftData.lateral_db).format("0,0")}</p>
                      </div>

                      <div>
                        <p className="font-bold">Flyover</p>
                        <p>{numeral(aircraftData.flyover_db).format("0,0")}</p>
                      </div>

                      <div>
                        <p className="font-bold">Aproach</p>
                        <p>{numeral(aircraftData.approach_db).format("0,0")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Weights params={aircraftData} unit={unit} />

              <div className="card">
                <h3 className="text-3xl">Dimensions</h3>

                <div className="grid md:grid-cols-2 md:text-center mt-6">
                  <div className="md:pr-6 py-4 flex flex-col justify-end md:border-r-2 border-[#DEDEDE]">
                    <h4 className="font-bold">Exterior Dimensions ({ucFirst(distanceUnit)})</h4>

                    <div className="flex md:justify-center mt-6 gap-6">
                      <div>
                        <p className="font-bold">Length</p>
                        <p>{numeral(aircraftData[`ext_length_${unit === "Imperial Units" ? "feet" : "meters"}`]).format("0,0")}</p>
                      </div>

                      <div>
                        <p className="font-bold">Height</p>
                        <p>{numeral(aircraftData[`${unit === "Imperial Units" ? "exterior_height_feet" : "ext_height_meters"}`]).format("0,0")}</p>
                      </div>

                      <div>
                        <p className="font-bold">Wingspan</p>
                        <p>{numeral(aircraftData[`wingspan_${unit === "Imperial Units" ? "feet" : "meters"}`]).format("0,0")}</p>
                      </div>
                    </div>
                  </div>
                  <div className="md:pl-6 py-4 flex flex-col justify-end">
                    <h4 className="font-bold">Interior Dimensions ({unit === "Imperial Units" ? "Feet" : "Meters"})</h4>

                    <div className="flex md:justify-center mt-6 gap-6">
                      <div>
                        <p className="font-bold">Length</p>
                        <p>{numeral(aircraftData[`int_length_${unit === "Imperial Units" ? "feet" : "meters"}`]).format("0,0")}</p>
                      </div>

                      <div>
                        <p className="font-bold">Height</p>
                        <p>{numeral(aircraftData[`int_height_${unit === "Imperial Units" ? "feet" : "meters"}`]).format("0,0")}</p>
                      </div>

                      <div>
                        <p className="font-bold">Width</p>
                        <p>{numeral(aircraftData[`int_width_${unit === "Imperial Units" ? "feet" : "meters"}`]).format("0,0")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col mt-6 justify-center md:text-center">
                  <h4 className="font-bold">Door Dimensions ({unit === "Imperial Units" ? "Feet" : "Meters"})</h4>

                  <div className="flex md:justify-center mt-6 gap-6">
                    <div>
                      <p className="font-bold">Height</p>
                      <p>{numeral(aircraftData[`door_height_${unit === "Imperial Units" ? "feet" : "meters"}`]).format("0,0")}</p>
                    </div>

                    <div>
                      <p className="font-bold">Width</p>
                      <p>{numeral(aircraftData[`door_width_${unit === "Imperial Units" ? "feet" : "meters"}`]).format("0,0")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 md:gap-6 gap-8">
            {aircraftData.aircraft_manufacturer && aircraftData.model && (
              <>
                <SimpleTableCard
                  title="Transaction History"
                  apiRoute="getRegistrations"
                  additionalApiFilters={`make=${aircraftData.aircraft_manufacturer}&model=${aircraftData.model}`}
                  timePeriod={1000}
                />

                <SimpleTableCard
                  title="Accident History"
                  apiRoute="getAccidents"
                  additionalApiFilters={"reg=" + regNumbers}
                  timePeriod={1000}
                />
              </>
            )}
          </div>

          <FlightsByAirport presetFilters={"reg=" + regNumbers} />

          <Similar params={similarAircrafts.filter((aircraft) => aircraft.id !== aircraftData.id)}/>
        </>
    )}
    </>
  );
}
