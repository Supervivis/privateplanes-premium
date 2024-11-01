import cn from "classnames";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import styles from "./styles/styles.module.scss";
import { useState, useEffect } from "react";
import numeral from "numeral";

ChartJS.register(ArcElement, Tooltip, Legend);
const OwnershipCosts = ({ params, region, conversionRate, currencySymbol }) => {
  const [nbHours, setNbHours] = useState(0);
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

  const getConvertedValueForParameter = (parameter) => {
    return params[`${regionInitials(region)}_${parameter}`] * conversionRate
  }

  const resetValues = () => {
    console.log("resetting values");

    setAircraftCostValues({
      crewSalary: (getConvertedValueForParameter("annual_employee_benefits") + getConvertedValueForParameter("annual_captain") + getConvertedValueForParameter("annual_first_office")),
      crewTraining: getConvertedValueForParameter("annual_crew_training"),
      hangar: getConvertedValueForParameter("annual_hangar"),
      insuranceHull: getConvertedValueForParameter("annual_insurance_hull"),
      insuranceLiability: getConvertedValueForParameter("annual_insurance_liability"),
      management: getConvertedValueForParameter("annual_management"),
      miscFixed: getConvertedValueForParameter("annual_misc"),
      fuelCost: getConvertedValueForParameter("hourly_fuel"),
      maintenance: getConvertedValueForParameter("hourly_maintenance"),
      engOverhaul: getConvertedValueForParameter("hourly_engine_overhaul"),
      groundFees: getConvertedValueForParameter("hourly_ground_fees"),
      miscVar: getConvertedValueForParameter("hourly_misc"),
      annualTotal: getConvertedValueForParameter("annual_total"),
    });
  }

  useEffect(() => {
    if (!params || !region) return;
    resetValues()
  }, [params, region]);

  useEffect(() => {
    if (Object.keys(aircraftCostValues).length === 0) return;

    let fixedCosts = [aircraftCostValues.crewSalary, aircraftCostValues.crewTraining, aircraftCostValues.hangar, aircraftCostValues.insuranceHull, aircraftCostValues.insuranceLiability, aircraftCostValues.management, aircraftCostValues.miscFixed]

    let variableCosts = [aircraftCostValues.fuelCost, aircraftCostValues.maintenance, aircraftCostValues.engOverhaul, aircraftCostValues.groundFees, aircraftCostValues.miscVar]

    setTotalFixedCost(fixedCosts.reduce((a, b) => a + b, 0))
    setHighestFixedCost(Math.max(...fixedCosts))

    setTotalVariableCost(variableCosts.reduce((a, b) => a + b, 0))
    setHighestVariableCost(Math.max(...variableCosts))
  }, [aircraftCostValues]);

  const barComponent = (colour, value) => {
    return (
    <div className="rounded-2xl overflow-hidden bg-[#e6e4e5] h-4 w-full">
      <div className="h-full" style={{width: `${value}%`, background: colour}}></div>
    </div>)
  }

  const percentageOfTotalCost = (value, highestValue) => {
    //console.log(value, highestValue)
    return ((value / highestValue) * 100).toFixed(0)
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    let newValue = parseFloat(value.replace(",", ""));
    console.log(newValue);
    setAircraftCostValues(prevValues => ({
      ...prevValues,
      [name]: newValue
    }));
  };

  const costRow = (displayName, variableName, colour, percentage) => {
    return (
      <tr>
        <td className="md:whitespace-nowrap  px-2 pb-2"><p>{displayName}</p></td>
        <td className="whitespace-nowrap px-2 xl:pl-12 pb-2">
          <span className="mr-2">{currencySymbol}</span>
          <input
            className={styles.cost_input}
            type="text"
            name={variableName}
            placeholder={displayName}
            value={numeral(aircraftCostValues[variableName]).format("0,0")}
            onInput={handleInputChange}
          />
        </td>
        <td className="w-full px-2 pb-2 hidden md:table-cell">{barComponent(colour, percentage)}</td>
      </tr>
    )
  }

  return (
  <>
    {Object.keys(aircraftCostValues).length > 0 &&
    <>
      <div className="card grid lg:grid-cols-2 no-padding gap-6 md:gap-8">
        <div className="overview-left-side p-5">
          <h3 className="text-3xl">Ownership Costs</h3>
          <div className="flex justify-center items-center my-12">
            <table>
              <tbody>
                <tr>
                  <td className="pr-4 pb-6 font-bold">Annual Flight Hours</td>
                  <td className="pb-6">
                    <input
                      className={styles.cost_input}
                      type="text"
                      name="nbHours"
                      placeholder="Enter hours"
                      value={nbHours}
                      onChange={(e) => setNbHours(parseFloat(e.target.value))}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="pr-4 font-bold">Annual Operating Costs</td>
                  <td className="pl-1">{currencySymbol}{numeral(
                    totalFixedCost + (nbHours * (totalVariableCost))
                    ).format("0,0")}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-4 items-center text-center">
            <div>
              <p className="font-bold">Fixed Costs</p>
              <p className="text-2xl">{currencySymbol}{numeral(totalFixedCost).format("0,0")}</p>

              <Pie
                data={{
                  labels: [
                    "Crew Salary",
                    "Crew Training",
                    "Hangar",
                    "Insurance",
                    "Management",
                    "Miscellaneous Fixed",
                  ],
                  datasets: [
                    {
                      data: [
                        aircraftCostValues.crewSalary,
                        aircraftCostValues.crewTraining,
                        aircraftCostValues.hangar,
                        aircraftCostValues.insuranceHull + aircraftCostValues.insuranceLiability,
                        aircraftCostValues.management,
                        aircraftCostValues.miscFixed,
                      ],
                      backgroundColor: [
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(54, 162, 235, 0.2)",
                        "rgba(255, 206, 86, 0.2)",
                        "rgba(75, 192, 192, 0.2)",
                        "rgba(153, 102, 255, 0.2)",
                        "rgba(255, 159, 64, 0.2)",
                      ],
                      borderColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>

            <div>
              <p className="font-bold">Variable Costs</p>
              <p className="text-2xl">{currencySymbol}{numeral(totalVariableCost).format("0,0")}</p>

              <Pie
                data={{
                  labels: [
                    "Fuel Cost",
                    "Maintenance",
                    "Engine Overhaul",
                    "Ground Fees",
                    "Miscellaneous Variable",
                  ],
                  datasets: [
                    {
                      data: [
                        aircraftCostValues.fuelCost,
                        aircraftCostValues.maintenance,
                        aircraftCostValues.engOverhaul,
                        aircraftCostValues.groundFees,
                        aircraftCostValues.miscVar,
                      ],
                      backgroundColor: [
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(54, 162, 235, 0.2)",
                        "rgba(255, 206, 86, 0.2)",
                        "rgba(75, 192, 192, 0.2)",
                        "rgba(153, 102, 255, 0.2)",
                      ],
                      borderColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className={`${cn(styles.ownership_main)} p-5`}>
          <h4 className="font-bold">Fixed Costs Breakdown</h4>

          <table className="table-auto w-full overflow-x-scroll">
            <tbody>
              {costRow("Crew Salary", "crewSalary", "#FF577A", percentageOfTotalCost(aircraftCostValues.crewSalary, highestFixedCost))}
              {costRow("Crew Training", "crewTraining", "#2999E6", percentageOfTotalCost(aircraftCostValues.crewTraining, highestFixedCost))}
              {costRow("Hangar", "hangar", "#FFC651", percentageOfTotalCost(aircraftCostValues.hangar, highestFixedCost))}
              {costRow("Insurance Hull", "insuranceHull", "#3AB8B8", percentageOfTotalCost(aircraftCostValues.insuranceHull, highestFixedCost))}
              {costRow("Insurance Liability", "insuranceLiability", "#3AB8B8", percentageOfTotalCost(aircraftCostValues.insuranceLiability, highestFixedCost))}
              {costRow("Management", "management", "#925DFD", percentageOfTotalCost(aircraftCostValues.management, highestFixedCost))}
              {costRow("Miscellaneous Fixed", "miscFixed", "#FF943D", percentageOfTotalCost(aircraftCostValues.miscFixed, highestFixedCost))}
            </tbody>
          </table>

          <h4 className="font-bold mt-8">Variable Costs Breakdown</h4>
          <table className="table-auto w-full">
            <tbody>
              {costRow("Fuel Cost", "fuelCost", "#FF577A", percentageOfTotalCost(aircraftCostValues.fuelCost, highestVariableCost))}
              {costRow("Maintenance", "maintenance", "#2999E6", percentageOfTotalCost(aircraftCostValues.maintenance, highestVariableCost))}
              {costRow("Engine Overhaul", "engOverhaul", "#FFC651", percentageOfTotalCost(aircraftCostValues.engOverhaul, highestVariableCost))}
              {costRow("Ground Fees", "groundFees", "#3AB8B8", percentageOfTotalCost(aircraftCostValues.groundFees, highestVariableCost))}
              {costRow("Miscellaneous Variable", "miscVar", "#925DFD", percentageOfTotalCost(aircraftCostValues.miscVar, highestVariableCost))}
            </tbody>
          </table>

          <button className={cn(styles.cost_input, "flex items-center justify-center no-padding w-40")} onClick={() => resetValues()}>Reset Values</button>
        </div>
      </div>
    </>
    }
  </>
  );
};

export default OwnershipCosts;