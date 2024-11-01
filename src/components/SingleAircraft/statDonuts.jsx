import cn from "classnames";
import styles from "./styles/styles.module.scss";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import numeral from "numeral";
import { useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const StatDonuts = ({ params, currencySymbol, conversionRate, regionPrefix, unit }) => {
  const [keyFacts, setKeyFacts] = useState([]);

  useEffect(() => {
    if (params.key_facts !== undefined) {
      setKeyFacts(params.key_facts.split("\n"));
    } else {
    }
  }, [params.key_facts]);

  const data_passengers = {
    datasets: [
      {
        label: "Pax",
        data: [params.max_pax, 19],
        backgroundColor: ["#56AD70", "rgba(255, 159, 64, 0.0)"],
        borderColor: ["#EBEBEB"],
        borderWidth: 2,
      },
    ],
  };
  const data_range = {
    datasets: [
      {
        label: "Range",
        data: [params.range_NM, 8000],
        backgroundColor: ["#DBE050", "rgba(255, 159, 64, 0.0)"],
        borderColor: ["#EBEBEB"],
        borderWidth: 2,
      },
    ],
  };

  const data_cruise = {
    datasets: [
      {
        label: "Cruise Speed",
        data: [params.high_cruise_knots, 516],
        backgroundColor: ["#DA3978", "rgba(255, 159, 64, 0.0)"],
        borderColor: ["#EBEBEB"],
        borderWidth: 2,
      },
    ],
  };

  const data_cost = {
    datasets: [
      {
        label: "Cost Per Hour",
        data: [params.NA_hourly_total, 10000],
        backgroundColor: ["#90EB4B", "rgba(255, 159, 64, 0.0)"],
        borderColor: ["#EBEBEB"],
        borderWidth: 2,
      },
    ],
  };

  const data_fuel = {
    datasets: [
      {
        label: "Hourly Fuel Burn",
        data: [params.hourly_fuel_burn_GPH, 626],
        backgroundColor: ["#D857F4", "rgba(255, 159, 64, 0.0)"],
        borderColor: ["#EBEBEB"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {  
    responsive: true,
    cutout: 50,
    plugins: { tooltip: { enabled: false } },
  };

  return (
    <>
      <div className="card h-full">
        <div className={`${cn(styles.doughnut_charts_wrapper)} grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 items-center h-full`}>

            <div className={cn(styles.chart_container)}>
              <span>Passengers</span>
              <Doughnut
                data={data_passengers}
                options={chartOptions}
              />
              <span className={styles.chart_label_passengers}>
                {params.max_pax}
                <br></br>
                <span className={styles.chart_label_description}>Pax</span>
              </span>
            </div>

            <div className={cn(styles.chart_container)}>
              <span>Range</span>
              <Doughnut
                data={data_range}
                options={chartOptions}
              />
              <span className={styles.chart_label_range}>
                {unit === "Imperial Units"
                  ? numeral(params.range_NM).format("0,0")
                  : numeral(params.range_km).format("0,0")}{" "}
                <br></br>
                <span className={styles.chart_label_description}>
                  {unit === "Imperial Units" ? "NM" : "KM"}
                </span>
              </span>
            </div>

            <div className={cn(styles.chart_container)}>
              <span>Cruise Speed</span>
              <Doughnut
                data={data_cruise}
                options={chartOptions}
              />
              <span className={styles.chart_label_cruise}>
                {unit === "Imperial Units"
                  ? numeral(params.high_cruise_knots).format("0,0")
                  : numeral(params.high_speed_cruise_kmh).format("0,0")}{" "}
                <br></br>
                <span className={styles.chart_label_description}>
                  {" "}
                  {unit === "Imperial Units" ? "Knots" : "Kmh"}
                </span>
              </span>
            </div>
            
            <div className={cn(styles.chart_container)}>
              <span>Cost per Hour</span>
              <Doughnut
                data={data_cost}
                options={chartOptions}
              />
              <span className={styles.chart_label_cost}>
                {currencySymbol}
                {params[`${regionPrefix}_hourly_total`] !== 0 ? numeral(params[`${regionPrefix}_hourly_total`]).format("0,0") : "-"}
                <br></br>
                <span className={styles.chart_label_description}>per hour</span>
              </span>
            </div>
            
            <div className={cn(styles.chart_container)}>
              <span>Fuel Burn</span>
              <Doughnut
                data={data_fuel}
                options={chartOptions}
              />
              <span className={styles.chart_label_fuel}>
                {unit === "Imperial Units"
                  ? numeral(params.hourly_fuel_burn_GPH).format("0,0")
                  : numeral(params.hourly_fuel_burn_LPH).format("0,0")}{" "}
                <br></br>
                <span className={styles.chart_label_description}>
                  {unit === "Imperial Units" ? "GPH" : "LPH"}
                </span>
              </span>
            </div>
          </div>
      </div>
    </>
  );
};

export default StatDonuts;
