import { useState, useEffect, useContext, useMemo } from "react";
import { StateContext } from "../../context";
import global from "../../components/styles/global.module.scss";
import Axios from "axios";

import StatComparisonCard from "../../components/CompareAircrafts/StatComparisonCard";
import AquisitionCost from "../../components/CompareAircrafts/AquisitionCost";
import Dimensions from "../../components/CompareAircrafts/Dimensions";
import Features from "../../components/CompareAircrafts/Features";
import Interior from "../../components/CompareAircrafts/Interior";
import KeyFacts from "../../components/CompareAircrafts/KeyFacts";
import OwnershipCost from "../../components/CompareAircrafts/OwnershipCost";
import Performance from "../../components/CompareAircrafts/Performance";
import Powerplant from "../../components/CompareAircrafts/Powerplant";
import Range from "../../components/CompareAircrafts/Range";
import Weights from "../../components/CompareAircrafts/Weight";
import ComparisonModal from "../../components/CompareAircrafts/comparisonModal";

import { useSearchParams } from "react-router-dom";

import styles from "./styles.module.scss";
import Dropdown from "../../components/common/Dropdown";
import {
  REGION_OPTIONS,
  CURRENCY_OPTIONS,
  UNIT_OPTIONS,
} from "../../utils/constants/app-constants";

const CompareAircrafts = () => {
  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const { allAircraftData } = useContext(StateContext);
  const [searchParams] = useSearchParams();
  const [aircraftsData, setAircraftsData] = useState([]);

  const comparisonIds = useMemo(() => {
    const ids = searchParams.get("aircrafts");
    return ids ? ids.split(",") : [];
  }, [searchParams]);

  useEffect(() => {
    console.log("Comparison ids triggering")
    async function fetchData() {
      const response = await allAircraftData();
      setAircraftsData(response.filter((aircraft) => comparisonIds.includes(aircraft.id.toString())));
    }
    if (comparisonIds.length > 0) fetchData();
  }, [comparisonIds]);

  const [unit, setUnit] = useState(UNIT_OPTIONS[0]);
  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0]);
  const [country, setCountry] = useState(REGION_OPTIONS[0]);
  // const [openModal, setOpenModal] = useState(false);

  const [conversionRate, setConversionRate] = useState(1);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  useEffect(() => {
    setCurrencySymbol(currency === "USD" ? "$" : currency === "GBP" ? "£" : "€");

    if (currency !== "USD") {
      Axios.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd.json`)
      .then((res) => {
        setConversionRate(res[currency.toLowerCase()]);
      });
    }
  }, [currency]);

  const onCurrencyChanged = (val) => {
    setCurrency(val);
  };

  const onUnitChanged = (val) => {
    setUnit(val);
  };

  const onCountryChanged = (val) => {
    setCountry(val);
  };

  return (
    <>
      {Object.keys(aircraftsData).length === 0 
        ? <>
            <div style={{width:"100%", height:"64.6svh", display:"flex", justifyContent:"center", alignItems:"center"}}>
              <h1>You have not selected any aircraft to compare</h1>
              <h1><a href="https://premium.compareprivateplanes.com/">Click here</a> to search aircraft to compare</h1>
            </div>
          </>
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
                value={country}
                setValue={(value) => onCountryChanged(value)}
                options={REGION_OPTIONS}
              />
              <Dropdown
                className={styles.dropdown}
                headerDropdown={true}
                value={currency}
                setValue={(value) => onCurrencyChanged(value)}
                options={CURRENCY_OPTIONS}
              />
              {aircraftsData.length === 2 && <ComparisonModal currentIds={comparisonIds} /> }
            </div>
          </div>

          <KeyFacts data={aircraftsData} comparisonIds={comparisonIds} />

          <StatComparisonCard
            title="Basic Info"
            data={aircraftsData}
            rows={[
              {"displayName": "Production Start", "variableName": "production_start", "isNumeral": false},
              {"displayName": "Production End", "variableName": "production_end", "isNumeral": false},
              {"displayName": "In Production?", "variableName": "in_production", "isNumeral": false},
              {"displayName": "Number Made", "variableName": "number_made", "isNumeral": true},
              {"displayName": "Number in Service", "variableName": "number_in_service", "isNumeral": true},
              {"displayName": "Serial Numbers", "variableName": "serial_numbers", "isNumeral": true},
            ]}
          />
          
          <Performance
            data={aircraftsData}
            currency={currency}
            country={country}
            unit={unit}
          />
          <OwnershipCost
            data={aircraftsData}
            conversionRate={conversionRate}
            currencySymbol={currencySymbol}
            region={country}
          />
          <AquisitionCost
            data={aircraftsData}
            currency={currency}
            country={country}
            unit={unit}
          />
          {/* <HistoricalMarket params={aircraftsData} /> */}
          <Range params={aircraftsData} />

          <Interior
            data={aircraftsData}
            currency={currency}
            country={country}
            unit={unit}
          />
          <Features
            data={aircraftsData}
            currency={currency}
            country={country}
            unit={unit}
          />
          <Powerplant
            data={aircraftsData}
            currency={currency}
            country={country}
            unit={unit}
          />
          <Weights
            data={aircraftsData}
            currency={currency}
            country={country}
            unit={unit}
          />
          <Dimensions
            data={aircraftsData}
            currency={currency}
            country={country}
            unit={unit}
          />
        </>
      }
    </>
  );
};

export default CompareAircrafts;
