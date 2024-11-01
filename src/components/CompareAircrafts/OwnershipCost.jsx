import React, { useEffect, useState } from "react";
import cn from "classnames";
import global from "../styles/global.module.scss";
import styles from "../SingleAircraft/styles/styles.module.scss";
import Axios from "axios";
import numeral from "numeral";
import SectionHeader from "../shared/SectionHeader";

const OwnershipCost = ({ data, region, conversionRate, currencySymbol, unit, setNbHoursProp }) => {
  console.log(data);

  const [aircraftCostValues, setAircraftCostValues] = useState({});
  const [totalFixedCost, setTotalFixedCost] = useState(0);
  const [highestFixedCost, setHighestFixedCost] = useState(0);
  const [totalVariableCost, setTotalVariableCost] = useState(0);
  const [highestVariableCost, setHighestVariableCost] = useState(0);

  function regionInitials(region) {
    const regionMap = {
      "North America": "NA",
      "South America": "SA",
      "Europe": "EU",
      "Asia": "AS"
    };
    
    return regionMap[region]
  }

  const getConvertedValuesForParameter = (parameter) => {
    return [data.map((aircraft) => {
      return aircraft[`${regionInitials(region)}_${parameter}`] * conversionRate
    })]
  }

  const resetValues = () => {
    console.log("resetting values");

    setAircraftCostValues({
      crewTraining: getConvertedValuesForParameter("annual_crew_training"),
      hangar: getConvertedValuesForParameter("annual_hangar"),
      insuranceHull: getConvertedValuesForParameter("annual_insurance_hull"),
      insuranceLiability: getConvertedValuesForParameter("annual_insurance_liability"),
      management: getConvertedValuesForParameter("annual_management"),
      miscFixed: getConvertedValuesForParameter("annual_misc"),
      fuelCost: getConvertedValuesForParameter("hourly_fuel"),
      maintenance: getConvertedValuesForParameter("hourly_maintenance"),
      engOverhaul: getConvertedValuesForParameter("hourly_engine_overhaul"),
      groundFees: getConvertedValuesForParameter("hourly_ground_fees"),
      miscVar: getConvertedValuesForParameter("hourly_misc"),
      annualTotal: getConvertedValuesForParameter("annual_total"),
      hourlyTotal: getConvertedValuesForParameter("hourly_total")
    });
  }

  useEffect(() => {
    console.log(aircraftCostValues)
  }, [aircraftCostValues]);

  useEffect(() => {
    if (!data || !region) return;
    resetValues()
  }, [data, region]);

  const getClassNameForIndex = (index) => {
    if (index === 1) {
      return cn(styles.performance_bar);
    } else if (index === 2) {
      return cn(styles.performance_bar, styles.floor_bar);
    }
    return cn(styles.performance_bar, styles.gradient);
  }

  const handleInputChange = (event) => {
    const { name, value, index } = event.target;
    setAircraftCostValues(prevValues => ({
      ...prevValues,
      [[name][index]]: parseFloat(value)
    }));
  };

  const outputRowForVariable = (variable, displayName, maintainDecimal) => { 
    console.log(aircraftCostValues[variable], variable)
    return (
      <tr>
        <td className="whitespace-nowrap px-2 pb-2"><p>{displayName}</p></td>
        <td className="whitespace-nowrap px-2 xl:pl-12 pb-2 w-full">
        {data.map((aircraft, index) => {
          return (
            <div className="flex gap-6 items-center pb-2">
              <div>
                <span className="mr-2">{currencySymbol}</span>
                <input
                  className={styles.cost_input}
                  type="text"
                  name={variable}
                  index={index}
                  placeholder={displayName}
                  value={maintainDecimal ? aircraftCostValues[variable][0][index] : numeral(aircraftCostValues[variable][0][index]).format("0,0")}
                  onInput={handleInputChange}
                />
              </div> 
              <div className="rounded-2xl overflow-hidden bg-[#e6e4e5] h-4 w-full">
                <div 
                  className={`${getClassNameForIndex(index)} h-full`}
                  style={{width: (aircraftCostValues[variable][0][index] / Math.max(...aircraftCostValues[variable][0]) * 100 + "%")}}
                />
              </div>
            </div>
          );
        })}
        </td>
      </tr>
    );
  }
  

  return (
    <>
    {Object.keys(aircraftCostValues).length > 0 && (
      <div className="card">
        <div className="flex justify-between items-start">
          <h3 className="text-3xl">Ownership Costs</h3>

          <table>
            <tbody>
              {data.map((aircraft, index) => {
                return (
                  <tr>
                    <td><div className={`${getClassNameForIndex(index)} h-6 w-10 rounded-none`}></div></td>
                    <td className="py-1 pl-2 text-xl font-bold">{aircraft.aircraft_name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <table className="table-auto w-full mt-8">
          <tbody>
            {outputRowForVariable("annualTotal", "Annual Total")}
            {outputRowForVariable("crewTraining", "Crew Training")}
            {outputRowForVariable("hangar", "Crew Training")}
            {outputRowForVariable("insuranceHull", "Insurance Hull")}
            {outputRowForVariable("insuranceLiability", "Insurance Liability")}
            {outputRowForVariable("management", "Management")}
            {outputRowForVariable("miscFixed", "Misc Fixed")}

            {outputRowForVariable("hourlyTotal", "Hourly Total")}
            {outputRowForVariable("fuelCost", "Fuel Cost")}
            {outputRowForVariable("maintenance", "Maintenance")}
            {outputRowForVariable("engOverhaul", "Engine Overhaul")}
            {outputRowForVariable("groundFees", "Ground Fees")}
            {outputRowForVariable("miscVar", "Misc Variable")}
          </tbody>
        </table>
      </div>
      )}
    </>
  );
};
export default OwnershipCost;
