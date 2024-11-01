import React, { useState, useEffect, useContext } from "react";
import cn from "classnames";
import { HiOutlineSearch } from "react-icons/hi";
import BounceLoader from "react-spinners/BounceLoader";
import Card from "../components/common/Card";
import Dropdown from "../components/common/Dropdown";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import {
  CATEGORY_OPTIONS,
  MANUFACTURER_OPTIONS,
  PRODUCTION_OPTIONS,
  CATEGORY_OPTIONS_DIC,
  MANUFACTURER_OPTIONS_DIC,
  PRODUCTION_OPTIONS_DIC,
  CURRENCY_OPTIONS,
  REGION_OPTIONS,
  UNIT_OPTIONS,
} from "../utils/constants/app-constants";
import { MdOutlineExpandMore } from "react-icons/md";
import styles from "../styles/Search.module.scss";
import { Button, Slider } from "@mui/material";
import numeral from "numeral";
import { StateContext } from "../context";

export default function Search() {
  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0]);
  const [conversionRate, setConversionRate] = useState(1);
  const [region, setRegion] = useState(REGION_OPTIONS[0]);
  const [unit, setUnit] = useState(UNIT_OPTIONS[0]);
  const [passengerExpanded, setPassengerExpanded] = useState(false);
  const [rangeExpanded, setRangeExpanded] = useState(false);
  const [cruiseExpanded, setCruiseExpanded] = useState(false);
  const [altitudeExpanded, setAltitudeExpanded] = useState(false);
  const [fuelBurnExpanded, setFuelBurnExpanded] = useState(false);
  const [baggageExpanded, setBaggageExpanded] = useState(false);
  const [takeOffExpanded, setTakeOffExpanded] = useState(false);
  const [landingDistanceExpanded, setLandingDistanceExpanded] = useState(false);
  const [hourlyPriceExpanded, setHourlyPriceExpanded] = useState(false);
  const [annualPriceExpanded, setAnnualPriceExpanded] = useState(false);
  const [purchasePriceAccordion, setPurchasePriceAccordion] = useState(false);
  const [aircraftData, setAircraftData] = useState([]);
  const [filteredAirCraftData, setFilteredAirCraftData] = useState([]);
  const [fetching, setFetching] = useState(false);
  const { allAircraftData, getCurrencyConversion } = useContext(StateContext);
  useEffect(() => {
    async function fetchData() {
      let cRate = await getCurrencyConversion(currency);
      setConversionRate(cRate);
    }
    fetchData();
  }, [currency]);

  const originalSearch = {
    "aircraft_name": "",
    "category": null,
    "aircraft_manufacturer": null,
    "in_production": null,
    "pax": null,
    "range": null,
    "cruise": null,
    "altitude": null,
    "fuel_burn": null,
    "baggage_capacity": null,
    "takeoff_distance": null,
    "landing_distance": null,
    "annual_cost": null,
    "hourly_price": null,
    "new_purchase": null,
    "pre_owned": null,
  };

  const [search, setSearch] = useState(originalSearch);

  // Initial data fetch and setting
  useEffect(() => {
    const contentContainer = document.getElementById('content-container');
    if (contentContainer) contentContainer.scrollTo(0, 0);

    const fetchData = async () => {
      setFetching(true);
      let data = await allAircraftData();
      setAircraftData(data);
      setFilteredAirCraftData(data);
      setFetching(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log(search)
    setFilteredAirCraftData(aircraftData.filter((item) => {
      return (
        (search.aircraft_name === "" || item.aircraft_name.toLowerCase().includes(search.aircraft_name.toLowerCase())) 
        && (search.category === null || item.category === search.category) 
        && (search.aircraft_manufacturer === null || item.aircraft_manufacturer === search.aircraft_manufacturer) 
        && (search.in_production === null || item.in_production === search.in_production) 
        && (search.pax === null || item.max_pax >= search.pax)
        && (search.range === null || (unit === 'Imperial Units' ? item.range_NM <= search.range : item.range_KM <= search.range))
        && (search.cruise === null || (unit === 'Imperial Units' ? item.high_cruise_knots <= search.cruise : item.high_speed_cruise_kmh <= search.cruise))
        && (search.altitude === null || (unit === 'Imperial Units' ? item.max_altitude_feet <= search.altitude : item.max_altitude_meters <= search.altitude))
        && (search.fuel_burn === null || (unit === 'Imperial Units' ? item.hourly_fuel_burn_GPH <= search.fuel_burn : item.hourly_fuel_burn_LPH <= search.fuel_burn))
        && (search.baggage_capacity === null || (unit === 'Imperial Units' ? item.baggage_capacity_CF <= search.baggage_capacity : item.baggage_capacity_cubicmeters <= search.baggage_capacity))
        && (search.takeoff_distance === null || (unit === 'Imperial Units' ? item.TO_distance_feet <= search.takeoff_distance : item.TO_distance_meters <= search.takeoff_distance))
        && (search.landing_distance === null || (unit === 'Imperial Units' ? item.landing_distance_feet <= search.landing_distance : item.landing_distance_meters <= search.landing_distance))
        && (search.annual_cost === null || item[`${regionPrefixes[region]}_annual_total`] <= search.annual_cost)
        && (search.hourly_price === null || item[`${regionPrefixes[region]}_hourly_total`] <= search.hourly_price)
        && (search.new_purchase === null || item.new_purchase <= search.new_purchase)
        && (search.pre_owned === null || item.average_pre_owned <= search.pre_owned)
      );
    }));
  }, [search]);

  const regionPrefixes = {
    "North America": "NA",
    "South America": "SA",
    "Europe": "EU",
    "Asia": "AS",
  };

  const handleEnumChange = (key, val) => {
    console.log(key, val)
    if (search[key] === val) {
      setSearch((currentSearch) => ({ ...currentSearch, [key]: null }))
    }
    else {
      setSearch((currentSearch) => ({ ...currentSearch, [key]: val }));
    }
  }

  const handleProductionChange = (val) => {
    if (search.in_production === val) {
      setSearch((currentSearch) => ({ ...currentSearch, in_production: null }))
    }
    else {
      setSearch((currentSearch) => ({ ...currentSearch, in_production: val }));
    }
  }

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 21; 
  const totalPages = Math.ceil(filteredAirCraftData.length / itemsPerPage);

  const renderPageNumbers = () => {
    let pages = [];

    // Logic to determine which buttons to show
    if (totalPages < 5) {
      // If there are 5 or fewer pages, show all page numbers
      for (let i = 1; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // More complex logic for when there are more than 5 pages
      if (currentPage < 3) {
        // Current page is 3 or less, show first 4 and last page
        pages = [1, 2, 3, 4, totalPages];
      } else if (currentPage > 3 && currentPage < totalPages - 2) {
        // Between page 4 and the third-to-last page
        pages = [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
      } else {
        // Last three pages
        pages = [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      }
    }

    // Render buttons based on pages array
    return pages.map(page => (
      <Button key={page} size="small" variant={currentPage === page ? `contained` : `outlined`} onClick={()=> {setCurrentPage(page)}}>{page}</Button>
    ));
  };

  const [buttonClass, setButtonClass] = useState("");

  const openFilter = () => {
    const filter = document.querySelector(".filters_target");
    if (filter.style.display === "none") {
      setButtonClass("filter-open");
      filter.style.display = "flex";
    } else {
      setButtonClass("");
      filter.style.display = "none";
    }
  };

  const maxVal = (key) => {
    return aircraftData.length === 0 ? 0 : aircraftData.reduce((max, item) => Math.max(max, item[key]), 0);
  }

  const minVal = (key) => {
    return aircraftData.length === 0 ? 0 : aircraftData.reduce((min, item) => Math.min(min, item[key]), aircraftData[0][key]);
  }

  const outputRange = (searchKey, itemKey) => {
    return search[searchKey] === null || search[searchKey] === minVal(itemKey) 
      ? `${numeral(minVal(itemKey)).format("0,0")}+`
      : `${numeral(minVal(itemKey)).format("0,0")} - ${numeral(search[searchKey]).format("0,0")}`
  }

  return (
    <div className={cn("section-pt80", styles.section)}>
      <div className={cn(styles.container)}>
        <div className={styles.row}>
          <span className={`${styles.open_filter} ${styles[buttonClass]}`} onClick={() => openFilter()}>
            <i className="fa-solid fa-sliders"></i>
          </span>


          <div className={"filters_target " + styles.filters}>
            <div className={styles.top}>
              <div className={styles.title}>Search Aircraft</div>
            </div>

            {JSON.stringify(search) !== JSON.stringify(originalSearch) && (
              <Button key={1} size="small" variant="contained" 
              onClick={()=> {
                setFilteredAirCraftData(aircraftData)
                setSearch(originalSearch)
              }}
              >
                Reset Filters
              </Button>
            )}

            <div className={styles.form}>
              <div className={styles.search}>
                <input
                  className={styles.input}
                  type="text"
                  value={search.aircraft_name}
                  onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, aircraft_name: e.target.value }))}
                  name="search"
                  placeholder="Search Aircraft"
                  required
                />
                <button className={styles.result}>
                  <HiOutlineSearch name="search" size="16" />
                </button>
              </div>
            </div>

            <div className={styles.sorting}>
              <div className={styles.dropdown}>
                <div className={styles.label}>Category</div>
                <Dropdown
                  className={styles.dropdown}
                  value={CATEGORY_OPTIONS_DIC[search.category]}
                  setValue={(value) => handleEnumChange("category", value)}
                  options={CATEGORY_OPTIONS}
                  placeholder="All categories"
                />
              </div>
            </div>
            <div className={styles.sorting}>
              <div className={styles.dropdown}>
                <div className={styles.label}>Manufacturer</div>
                <Dropdown
                  className={styles.dropdown}
                  value={MANUFACTURER_OPTIONS_DIC[search.aircraft_manufacturer]}
                  setValue={(value) => handleEnumChange("aircraft_manufacturer", value)}
                  options={MANUFACTURER_OPTIONS}
                  placeholder="All manufacturers"
                />
              </div>
            </div>
            <div className={styles.sorting}>
              <div className={styles.dropdown}>
                <div className={styles.label}>In Production</div>{" "}
                <Dropdown
                  className={styles.dropdown}
                  value={
                    PRODUCTION_OPTIONS_DIC[
                      search.in_production === true
                        ? "Yes"
                        : search.in_production === false
                        ? "No"
                        : "Select"
                    ]
                  }
                  setValue={(value) => handleProductionChange(value === "Yes")}
                  options={PRODUCTION_OPTIONS}
                  placeholder={"-"}
                />
              </div>
            </div>

            <div>
              <Accordion
                expanded={passengerExpanded}
                onChange={() => setPassengerExpanded(!passengerExpanded)}
              >
                <AccordionSummary
                  expandIcon={<MdOutlineExpandMore />}
                  aria-controls="panel4bh-content"
                  id="panel4bh-header"
                >
                  <div className={styles.label}>
                    Passengers: {search.pax === null ? `` : `${search.pax}+`}
                  </div>
                </AccordionSummary>
                <div className={styles.range}>
                  <Slider
                    className={styles.slider_home}
                    getAriaLabel={() => "Minimum passengers"}
                    value={search.pax === null ? 0 : search.pax}
                    max={aircraftData.reduce((max, item) => Math.max(max, item.max_pax), 0)}
                    min={minVal('max_pax')}
                    onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, pax: val }))}
                    valueLabelDisplay="auto"
                    disableSwap
                    step={1}
                    />
                </div>
              </Accordion>
            </div>

            <div>
              <Accordion
                expanded={rangeExpanded}
                onChange={() => setRangeExpanded(!rangeExpanded)}
              >
                <AccordionSummary
                  expandIcon={<MdOutlineExpandMore />}
                  aria-controls="panel4bh-content"
                  id="panel4bh-header"
                >
                  <div className={styles.label}>
                    Range ({ unit === 'Imperial Units' ?'NM': 'KM'}): {outputRange('range', unit === 'Imperial Units' ? 'range_NM' : 'range_KM')}
                  </div>
                </AccordionSummary>
                <div className={styles.range}>
                  <Slider
                    className={styles.slider_home}
                    getAriaLabel={() => "Minimum distance"}
                    value={search.range === null ? minVal(unit === 'Imperial Units' ? 'range_NM' : 'range_KM') : search.range}
                    max={maxVal(unit === 'Imperial Units' ? 'range_NM' : 'range_KM')}
                    min={minVal(unit === 'Imperial Units' ? 'range_NM' : 'range_KM')}
                    onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, range: val === minVal(unit === 'Imperial Units' ? 'range_NM' : 'range_KM') ? null : val}))}
                    valueLabelDisplay="auto"
                    disableSwap
                    step={500}
                  />
                </div>
              </Accordion>
            </div>
            
            <div>
              <Accordion
                expanded={cruiseExpanded}
                onChange={() => setCruiseExpanded(!cruiseExpanded)}
              >
                <AccordionSummary
                  expandIcon={<MdOutlineExpandMore />}
                  aria-controls="panel4bh-content"
                  id="panel4bh-header"
                >
                  <div className={styles.label}>
                    Cruise Speed ({ unit === 'Imperial Units' ?'Knots': 'KMH'}): {outputRange('cruise', unit === 'Imperial Units' ? 'high_cruise_knots' : 'high_speed_cruise_kmh')}
                  </div>
                </AccordionSummary>
                <div className={styles.range}>
                  <Slider
                    className={styles.slider_home}
                    getAriaLabel={() => "Minimum speed"}
                    value={search.cruise === null ? minVal(unit === 'Imperial Units' ? 'high_cruise_knots' : 'high_speed_cruise_kmh') : search.cruise}
                    max={maxVal(unit === 'Imperial Units' ? 'high_cruise_knots' : 'high_speed_cruise_kmh')}
                    min={minVal(unit === 'Imperial Units' ? 'high_cruise_knots' : 'high_speed_cruise_kmh')}
                    onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, cruise: val === minVal(unit === 'Imperial Units' ? 'high_cruise_knots' : 'high_speed_cruise_kmh') ? null : val}))}
                    valueLabelDisplay="auto"
                    disableSwap
                    step={50}
                  />
                </div>
              </Accordion>
            </div>

            <div>
              <Accordion
                expanded={altitudeExpanded}
                onChange={() => setAltitudeExpanded(!altitudeExpanded)}
              >
                <AccordionSummary
                  expandIcon={<MdOutlineExpandMore />}
                  aria-controls="panel4bh-content"
                  id="panel4bh-header"
                >
                  <div className={styles.label}>
                    Max Altitude ({ unit === 'Imperial Units' ?'Feet': 'Meters'}): {outputRange('altitude', unit === 'Imperial Units' ? 'max_altitude_feet' : 'max_altitude_meters')}
                  </div>
                </AccordionSummary>
                <div className={styles.range}>
                  <Slider
                    className={styles.slider_home}
                    getAriaLabel={() => "Minimum altitude"}
                    value={search.altitude === null ? minVal(unit === 'Imperial Units' ? 'max_altitude_feet' : 'max_altitude_meters') : search.altitude}
                    max={maxVal(unit === 'Imperial Units' ? 'max_altitude_feet' : 'max_altitude_meters')}
                    min={minVal(unit === 'Imperial Units' ? 'max_altitude_feet' : 'max_altitude_meters')}
                    onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, altitude: val === minVal(unit === 'Imperial Units' ? 'max_altitude_feet' : 'max_altitude_meters') ? null : val}))}
                    valueLabelDisplay="auto"
                    disableSwap
                    step={500}
                  />
                </div>
              </Accordion>
            </div>

            <div>
              <Accordion
                expanded={fuelBurnExpanded}
                onChange={() => setFuelBurnExpanded(!fuelBurnExpanded)}
              >
                <AccordionSummary
                  expandIcon={<MdOutlineExpandMore />}
                  aria-controls="panel4bh-content"
                  id="panel4bh-header"
                >
                  <div className={styles.label}>
                    Fuel Burn ({ unit === 'Imperial Units' ?'GPH': 'LPH'}): {outputRange('fuel_burn', unit === 'Imperial Units' ? 'hourly_fuel_burn_GPH' : 'hourly_fuel_burn_LPH')}
                  </div>
                </AccordionSummary>
                <div className={styles.range}>
                  <Slider
                    className={styles.slider_home}
                    getAriaLabel={() => "Minimum fuel burn"}
                    value={search.fuel_burn === null ? minVal(unit === 'Imperial Units' ? 'hourly_fuel_burn_GPH' : 'hourly_fuel_burn_LPH') : search.fuel_burn}
                    max={maxVal(unit === 'Imperial Units' ? 'hourly_fuel_burn_GPH' : 'hourly_fuel_burn_LPH')}
                    min={minVal(unit === 'Imperial Units' ? 'hourly_fuel_burn_GPH' : 'hourly_fuel_burn_LPH')}
                    onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, fuel_burn: val === minVal(unit === 'Imperial Units' ? 'hourly_fuel_burn_GPH' : 'hourly_fuel_burn_LPH') ? null : val}))}
                    valueLabelDisplay="auto"
                    disableSwap
                    step={5}
                  />
                </div>
              </Accordion>
            </div>

            <div>
              <Accordion
                expanded={baggageExpanded}
                onChange={() => setBaggageExpanded(!baggageExpanded)}
              >
                <AccordionSummary
                  expandIcon={<MdOutlineExpandMore />}
                  aria-controls="panel4bh-content"
                  id="panel4bh-header"
                >
                  <div className={styles.label}>
                    Baggage Capacity ({ unit === 'Imperial Units' ?'CF': 'Cubic Meters'}): {outputRange('baggage_capacity', unit === 'Imperial Units' ? 'baggage_capacity_CF' : 'baggage_capacity_cubicmeters')}
                  </div>
                </AccordionSummary>
                <div className={styles.range}>
                  <Slider
                    className={styles.slider_home}
                    getAriaLabel={() => "Minimum baggage capacity"}
                    value={search.baggage_capacity === null ? minVal(unit === 'Imperial Units' ? 'baggage_capacity_CF' : 'baggage_capacity_cubicmeters') : search.baggage_capacity}
                    max={maxVal(unit === 'Imperial Units' ? 'baggage_capacity_CF' : 'baggage_capacity_cubicmeters')}
                    min={minVal(unit === 'Imperial Units' ? 'baggage_capacity_CF' : 'baggage_capacity_cubicmeters')}
                    onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, baggage_capacity: val === minVal(unit === 'Imperial Units' ? 'baggage_capacity_CF' : 'baggage_capacity_cubicmeters') ? null : val}))}
                    valueLabelDisplay="auto"
                    disableSwap
                    step={1}
                  />
                </div>
              </Accordion>
            </div>

            <div>
              <Accordion
                expanded={takeOffExpanded}
                onChange={() => setTakeOffExpanded(!takeOffExpanded)}
              >
                <AccordionSummary
                  expandIcon={<MdOutlineExpandMore />}
                  aria-controls="panel4bh-content"
                  id="panel4bh-header"
                >
                  <div className={styles.label}>
                    Takeoff Distance ({ unit === 'Imperial Units' ?'Feet': 'Meters'}): {outputRange('takeoff_distance', unit === 'Imperial Units' ? 'TO_distance_feet' : 'TO_distance_meters')}
                  </div>
                </AccordionSummary>
                <div className={styles.range}>
                  <Slider
                    className={styles.slider_home}  
                    getAriaLabel={() => "Minimum takeoff distance"} 
                    value={search.takeoff_distance === null ? minVal(unit === 'Imperial Units' ? 'TO_distance_feet' : 'TO_distance_meters') : search.takeoff_distance}
                    max={maxVal(unit === 'Imperial Units' ? 'TO_distance_feet' : 'TO_distance_meters')}
                    min={minVal(unit === 'Imperial Units' ? 'TO_distance_feet' : 'TO_distance_meters')}
                    onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, takeoff_distance: val === minVal(unit === 'Imperial Units' ? 'TO_distance_feet' : 'TO_distance_meters') ? null : val}))}
                    valueLabelDisplay="auto"
                    disableSwap
                    step={500}
                  />
                </div>
              </Accordion>
            </div>

            <div>
              <Accordion
                expanded={landingDistanceExpanded}
                onChange={() => setLandingDistanceExpanded(!landingDistanceExpanded)}
              >
                <AccordionSummary
                  expandIcon={<MdOutlineExpandMore />}
                  aria-controls="panel4bh-content"
                  id="panel4bh-header"
                >
                  <div className={styles.label}>
                    Landing Distance ({ unit === 'Imperial Units' ?'Feet': 'Meters'}): {outputRange('landing_distance', unit === 'Imperial Units' ? 'landing_distance_feet' : 'landing_distance_meters')}
                  </div>
                </AccordionSummary>
                <div className={styles.range}>
                  <Slider
                    className={styles.slider_home}
                    getAriaLabel={() => "Minimum landing distance"}
                    value={search.landing_distance === null ? minVal(unit === 'Imperial Units' ? 'landing_distance_feet' : 'landing_distance_meters') : search.landing_distance}
                    max={maxVal(unit === 'Imperial Units' ? 'landing_distance_feet' : 'landing_distance_meters')}
                    min={minVal(unit === 'Imperial Units' ? 'landing_distance_feet' : 'landing_distance_meters')}
                    onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, landing_distance: val === minVal(unit === 'Imperial Units' ? 'landing_distance_feet' : 'landing_distance_meters') ? null : val}))}
                    valueLabelDisplay="auto"
                    disableSwap
                    step={500}
                  />
                </div>
              </Accordion>
            </div>

            <div>
              <Accordion
                expanded={hourlyPriceExpanded}
                onChange={() => setHourlyPriceExpanded(!hourlyPriceExpanded)}
              >
                <AccordionSummary
                  expandIcon={<MdOutlineExpandMore />}
                  aria-controls="panel4bh-content"
                  id="panel4bh-header"
                >
                  <div className={styles.label}>
                    Hourly Price ({currency}): {outputRange('hourly_price', `${regionPrefixes[region]}_hourly_total`)}
                  </div>
                </AccordionSummary>
                <div className={styles.range}>
                  <Slider
                    className={styles.slider_home}
                    getAriaLabel={() => "Minimum hourly price"}
                    value={search.hourly_price === null ? minVal(`${regionPrefixes[region]}_hourly_total`) : search.hourly_price}
                    max={maxVal(`${regionPrefixes[region]}_hourly_total`)}
                    min={minVal(`${regionPrefixes[region]}_hourly_total`)}
                    onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, hourly_price: val === minVal(`${regionPrefixes[region]}_hourly_total`) ? null : val}))}
                    valueLabelDisplay="auto"
                    disableSwap
                    step={100}
                  />
                </div>
              </Accordion>
            </div>

            <div>
              <Accordion
                expanded={annualPriceExpanded}
                onChange={() => setAnnualPriceExpanded(!annualPriceExpanded)}
              >
                <AccordionSummary
                  expandIcon={<MdOutlineExpandMore />}
                  aria-controls="panel4bh-content"
                  id="panel4bh-header"
                >
                  <div className={styles.label}>
                    Annual Price ({currency}): {outputRange('annual_cost', `${regionPrefixes[region]}_annual_total`)}
                  </div>
                </AccordionSummary>
                <div className={styles.range}>
                  <Slider
                    className={styles.slider_home}
                    getAriaLabel={() => "Minimum annual price"}
                    value={search.annual_cost === null ? minVal(`${regionPrefixes[region]}_annual_total`) : search.annual_cost}
                    max={maxVal(`${regionPrefixes[region]}_annual_total`)}
                    min={minVal(`${regionPrefixes[region]}_annual_total`)}
                    onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, annual_cost: val === minVal(`${regionPrefixes[region]}_annual_total`) ? null : val}))}
                    valueLabelDisplay="auto"
                    disableSwap
                    step={1000}
                  />
                </div>
              </Accordion>
            </div>

            <div>
              <Accordion
                expanded={purchasePriceAccordion}
                onChange={() => setPurchasePriceAccordion(!purchasePriceAccordion)}
              >
                <AccordionSummary
                  expandIcon={<MdOutlineExpandMore />}
                  aria-controls="panel4bh-content"
                  id="panel4bh-header"
                >
                  <div className={styles.label}>
                    New Purchase Price ({currency}): {outputRange('new_purchase', 'new_purchase')}
                  </div>
                </AccordionSummary>
                <div className={styles.range}>
                  <Slider
                    className={styles.slider_home}
                    getAriaLabel={() => "Minimum purchase price"}
                    value={search.new_purchase === null ? minVal('new_purchase') : search.new_purchase}
                    max={maxVal('new_purchase')}
                    min={minVal('new_purchase')}
                    onChange={(e, val) => setSearch((currentSearch) => ({ ...currentSearch, new_purchase: val === minVal('new_purchase') ? null : val}))}
                    valueLabelDisplay="auto"
                    disableSwap
                    step={100000}
                  />
                </div>
              </Accordion>
            </div>
          </div>

          <div className={styles.wrapper}>
            <div className={`${styles.dropdown} my-4 md:my-0`}>
              <Dropdown
                className={styles.dropdown}
                headerDropdown={true}
                value={unit}
                setValue={(value) => setUnit(value)}
                options={UNIT_OPTIONS}
              />
              <Dropdown
                headerDropdown={true}
                className={styles.dropdown}
                value={region}
                setValue={(value) => setRegion(value)}
                options={REGION_OPTIONS}
              />
              <Dropdown
                className={styles.dropdown}
                headerDropdown={true}
                value={currency}
                setValue={(value) => setCurrency(value)}
                options={CURRENCY_OPTIONS}
              />
            </div>
            {fetching 
                ? <div className="flex justify-center items-center h-96 w-full">
                    <BounceLoader color={"#123abc"} loading={fetching} size={150} />
                  </div>
                : filteredAirCraftData.length === 0
                  ? <div className="flex justify-center items-center h-96">
                      <h1>No Aircraft Found</h1>
                    </div>
                  : <div className={styles.list}>
                    {filteredAirCraftData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                      <Card
                        className={styles.card}
                        item={product}
                        key={product.aircraft_id}
                        unit={unit}
                        currency={currency}
                        region={region}
                        conversionRate={conversionRate}
                      />
                    ))}
                    </div>
            }
            <div className="flex gap-2 items-center mt-10 justify-center">
                <Button size="small" disabled={currentPage === 1} variant="outlined" onClick={()=>{currentPage > 1 && setCurrentPage((num)=> num - 1)}}>{'<'}</Button>
                {renderPageNumbers()}
                <Button size="small" disabled={currentPage >= totalPages} variant="outlined" onClick={()=>{setCurrentPage((num)=>num < totalPages ? num +1 : num)}}>{'>'}</Button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
