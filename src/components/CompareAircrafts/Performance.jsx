import React from "react";
import cn from "classnames";
import styles from "../SingleAircraft/styles/styles.module.scss";
import numeral from "numeral";

const Performance = ({ data, unit }) => {

  const getMaxValueForVariable = (variable) => {
    const values = data.map((aircraft) => aircraft[variable]);
    return Math.max(...values);
  }

  const getClassNameForIndex = (index) => {
    if (index === 1) {
      return cn(styles.performance_bar);
    } else if (index === 2) {
      return cn(styles.performance_bar, styles.floor_bar);
    }
    return cn(styles.performance_bar, styles.gradient);
  }

  const outputRowForVariable = (variable, displayName, maintainDecimal) => { 
    return (
      <tr>
        <td className="pb-6">{displayName}</td>
        <td className="pb-6 pl-4 w-full">
        {data.map((aircraft, index) => {
          return (
            <div 
              className={getClassNameForIndex(index)}
              style={{width: (aircraft[variable] / getMaxValueForVariable(variable) * 100 + "%")}}
            >
              {maintainDecimal ? aircraft[variable] : numeral(aircraft[variable]).format("0,0")}
            </div>
          );
        })}
        </td>
      </tr>
    );
  }

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-start">
          <h3 className="text-3xl">Performance</h3>

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

        <div className="grid md:grid-cols-2">
          <div className="pr-6 py-6 border-r-2 border-[#DEDEDE]">
            <table className="table-auto mt-8">
              <tbody>
                {outputRowForVariable("range_NM", "Range (NM)")}

                {unit === "Imperial Units" 
                  ? outputRowForVariable("range_Miles", "Range (Miles)") 
                  : outputRowForVariable("range_km", "Range (KM)")
                }

                {unit === "Imperial Units" 
                  ? outputRowForVariable("hourly_fuel_burn_GPH", "Fuel Burn (GPH)") 
                  : outputRowForVariable("hourly_fuel_burn_LPH", "Fuel Burn (LPH)")
                }

                {unit === "Imperial Units" 
                  ? outputRowForVariable("max_altitude_feet", "Max Altitude (Feet)") 
                  : outputRowForVariable("max_altitude_meters", "Max Altitude (Meters)")
                }

                {unit === "Imperial Units" 
                  ? outputRowForVariable("rate_climb", "Climb Rate (Feet / Min)") 
                  : outputRowForVariable("rate_climb_meters", "Climb Rate (Meters / Min)")
                }

                {unit === "Imperial Units" 
                  ? outputRowForVariable("initial_cruise_altitude", "Initial Cruise Altitude (Feet)") 
                  : outputRowForVariable("initial_cruise_altitude_meters", "Initial Cruise Altitude (Meters)")
                }

                {unit === "Imperial Units" 
                  ? outputRowForVariable("TO_distance_feet", "Take Off Distance (Feet)") 
                  : outputRowForVariable("TO_distance_meters", "Take Off Distance (Meters)")
                }

                {unit === "Imperial Units" 
                  ? outputRowForVariable("landing_distance_feet", "Landing Distance (Feet)") 
                  : outputRowForVariable("landing_distance_meters", "Landing Distance (Meters)")
                }
              </tbody>
            </table>
          </div>
          <div className="pl-6 py-6 flex flex-col">
            <h3 className="text-2xl mt-auto">High Cruise Speed</h3>
            <table className="table-auto mt-8">
              <tbody>
                {outputRowForVariable("high_cruise_knots", "Knots")}

                {unit === "Imperial Units" 
                  ? outputRowForVariable("high_cruise_MPH", "MPH") 
                  : outputRowForVariable("high_speed_cruise_kmh", "KHM")
                }

                {outputRowForVariable("high_cruise_Mach", "Mach", true)}
              </tbody>
            </table>

            <h3 className="text-2xl mt-10">Long Range Cruise Speed</h3>
            <table className="table-auto mt-8 mb-auto">
              <tbody>
                {outputRowForVariable("long_range_cruise_knots", "Knots")}

                {unit === "Imperial Units" 
                  ? outputRowForVariable("long_range_cruise_MPH", "MPH") 
                  : outputRowForVariable("long_range_cruise_kmh", "KHM")
                }

                {outputRowForVariable("long_range_cruise_Mach", "Mach", true)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
export default Performance;
