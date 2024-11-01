import cn from "classnames";
import global from "../styles/global.module.scss";
import styles from "./styles/styles.module.scss";
import numeral from "numeral";

const PerformanceData = ({ params, unit }) => {
  const altitudeUnit = unit === "Imperial Units" ? "Feet" : "Meters";
  const cruiseSpeedShort = unit === "Imperial Units" ? "long_range_cruise_MPH" : "KMH";

  const groundPerformance = () => {
    const variableUnit = unit === "Imperial Units" ? "feet" : "meters";
    const TO_distance = params[`TO_distance_${variableUnit}`];
    const landing_distance = params[`landing_distance_${variableUnit}`];
    const maxVal = Math.max(TO_distance, landing_distance);
    return (
      <table className="mt-6 border-collapse border-0">
        <tbody>
          <tr>
            <td className="whitespace-nowrap">Take Off</td>
            <td className="pl-4 w-full">
              <div 
                className={cn(styles.performance_bar, styles.floor_bar)}
                style={{width: `${TO_distance / maxVal * 100}%`}}
              >
                {numeral(TO_distance).format("0,0")}&nbsp;{altitudeUnit}
              </div>
            </td>
          </tr>
          <tr>
            <td>Landing</td>
            <td className="pl-4 w-full">
              <div 
                className={cn(styles.performance_bar)}
                style={{width: `${landing_distance / maxVal * 100}%`}}
              >
                {numeral(landing_distance).format("0,0")}&nbsp;{altitudeUnit}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  return (
    <div className="card flex-grow flex-col flex justify-center">
      <div className="grid md:grid-cols-2">
        <div className="pr-6 py-6 md:border-r-2 border-[#DEDEDE]">
          <h3 className="text-3xl">Cruise Speed</h3>

          <table className="mt-8">
            <tbody>
              <tr>
                <td className="pb-6">Knots</td>
                <td className="pb-6 pl-4 w-full">
                  <div className={cn(styles.performance_bar, styles.gradient)}>
                    {params.high_cruise_knots}
                  </div>
                  <div className={cn(styles.performance_bar)}
                    style={{width: `${params.long_range_cruise_knots / params.high_cruise_knots * 100}%`}}>
                    {params.long_range_cruise_knots}
                  </div>
                </td>
              </tr>

              
              <tr>
                <td className="pb-6">{unit === "Imperial Units" ? "MPH" : "KMH"}</td>
                <td className="pb-6 pl-4 w-full">
                  <div className={cn(styles.performance_bar, styles.gradient)}>
                    {params[`${unit === "Imperial Units" ? "high_cruise_MPH" : "high_speed_cruise_kmh"}`]}
                  </div>
                  <div className={cn(styles.performance_bar)}
                    style={{width: `${params[`long_range_cruise_${unit === "Imperial Units" ? "MPH" : "kmh"}`] / params[`high_cruise_${unit === "Imperial Units" ? "MPH" : "kmh"}`] * 100}%`}}>
                    {params[`long_range_cruise_${unit === "Imperial Units" ? "MPH" : "kmh"}`]}
                  </div>
                </td>
              </tr>

              

              <tr>
                <td>Mach</td>
                <td className="pl-4 w-full">
                  <div className={cn(styles.performance_bar, styles.gradient)}>
                    {params.high_cruise_Mach}
                  </div>
                  <div className={cn(styles.performance_bar)}
                    style={{width: `${params.long_range_cruise_Mach / params.high_cruise_Mach * 100}%`}}>
                    {params.long_range_cruise_Mach}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="md:pl-6 py-6">
          <h3 className="text-3xl">Altitudes</h3>
          
          <p className="mt-6">Initial Cruise Altitude ({altitudeUnit})</p>
          <div className={cn(styles.performance_bar, styles.gradient, "ml-4")}>
            {numeral(params[`initial_cruise_altitude${unit === "Imperial Units" ? "" : "_meters"}`]).format("0,0")}
          </div>

          <p className="mt-2">Max Altitude ({altitudeUnit})</p>
          <div className={cn(styles.performance_bar, styles.gradient, "ml-4")}>
            {numeral(params[`max_altitude_${unit === "Imperial Units" ? "feet" : "meters"}`]).format("0,0")}
          </div>

          <p className="mt-2">Rate of Climb ({altitudeUnit} per minute)</p>
          <div className={cn(styles.performance_bar, styles.gradient, "ml-4")}>
            {numeral(params[`rate_climb${unit === "Imperial Units" ? "" : "_meters"}`]).format("0,0")}
          </div>

          <p className="mt-2">Fuel Burn ({unit === "Imperial Units" ? "Gallons" : "Liters"} per hour)</p>
          <div className={cn(styles.performance_bar, styles.gradient, "ml-4")}>
            {numeral(params[`hourly_fuel_burn_${unit === "Imperial Units" ? "GPH" : "LPH"}`]).format("0,0")}
          </div>
        </div>
      </div>

      <h3 className="text-3xl mt-8">Ground Performance</h3>
      {groundPerformance()}
    </div>
  );
};

export default PerformanceData;
