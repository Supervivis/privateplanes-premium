import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Card.module.scss";
import numeral from "numeral";

const Card = ({ className, item, unit, currency, country, conversionRate }) => {
  console.log(conversionRate)
  const [regionPrefix, setRegionPrefix] = useState("NA");
  const [currencySymbol, setCurrencySymbol] = useState("$");

  useEffect(() => {
    if (country === "North America") {
      setRegionPrefix("NA");
    } else if (country === "South America") {
      setRegionPrefix("SA");
    } else if (country === "Europe") {
      setRegionPrefix("EU");
    } else {
      setRegionPrefix("AS");
    }

    if (currency === "USD") {
      setCurrencySymbol("$");
    } else if (currency === "GBP") {
      setCurrencySymbol("£");
    } else {
      setCurrencySymbol("€");
    }
  }, [country, currency]);
  
  const statDisplay = (icon, label, value) => {
    return (
      <div className="flex items-center gap-1 mt-2 text-sm">
        <div className="w-6 flex items-center justify-center">
          <i class={`fa-solid fa-${icon}`}></i>
        </div>
        <span className="font-medium">{label}:</span>&nbsp;{value}
      </div>
    );
  }

  return (
    <div className="card w-full max-w-[400px] h-full mt-2 md:mt-8" aria-hidden="true">
      <Link
        to={`/aircraft?id=${item.id}`}
        state={{
          aircraftData: item
        }}
      >
        <div className="pt-6 w-full px-4">
          <div className="w-full border-b pb-4 flex items-center justify-center">
            <img 
              class="max-w-52 px-4" 
              src={item?.aircraft_image}
              alt={`${item?.aircraft_name}`} 
            />
          </div>
        </div>
        <div className="px-3 pt-4">
          <div className={styles.status}>
            <p className="font-semibold">{`${item?.aircraft_name}`} </p>

            {statDisplay("user-group", "Number of Passengers", item?.max_pax > 0 ? `${item?.max_pax} ` : "N/A")}

            {statDisplay("map", "Range", unit === "Imperial Units" ? item?.range_NM > 0 ? `${numeral(item?.range_NM).format("0,0")} NM` : "N/A" : item?.range_km > 0 ? `${numeral(item?.range_km).format("0,0")} KM` : "N/A")}

            {statDisplay("gauge-simple-high", "High Speed Cruise", unit === "Imperial Units" ? item?.high_cruise_knots > 0 ? `${numeral(item?.high_cruise_knots).format("0,0")} knots` : "N/A" : item?.high_speed_cruise_kmh > 0 ? `${numeral(item?.high_speed_cruise_kmh).format("0,0")} kmh` : "N/A")}

            {statDisplay("triangle-exclamation", "Max Altitude", unit === "Imperial Units" ? item?.max_altitude_feet > 0 ? `${numeral(item?.max_altitude_feet).format("0,0")} ` : "N/A" : item?.max_altitude_meters > 0 ? `${numeral(item?.max_altitude_meters).format("0,0")} ` : "N/A")}

            {statDisplay("fire", "Hourly Fuel Burn", unit === "Imperial Units" ? item?.hourly_fuel_burn_GPH > 0 ? `${numeral(item?.hourly_fuel_burn_GPH).format("0,0")} GPH` : "N/A" : item?.hourly_fuel_burn_LPH > 0 ? `${numeral(item?.hourly_fuel_burn_LPH).format("0,0")} LPH` : "N/A")}

            {statDisplay("cube", "Baggage Capacity", unit === "Imperial Units" ? item?.baggage_capacity_CF > 0 ? `${item?.baggage_capacity_CF} CF` : "N/A" : item?.baggage_capacity_cubicmeters > 0 ? `${item?.baggage_capacity_cubicmeters} CM` : "N/A")}

            {statDisplay("plane-departure", "Take-Off Distance", unit === "Imperial Units" ? item?.TO_distance_feet > 0 ? `${numeral(item?.TO_distance_feet).format("0,0")} feet` : "N/A" : item?.TO_distance_meters > 0 ? `${numeral(item?.TO_distance_meters).format("0,0")} meters` : "N/A")}

            {statDisplay("plane-arrival", "Landing Distance", unit === "Imperial Units" ? item?.landing_distance_feet > 0 ? `${numeral(item?.landing_distance_feet).format("0,0")} feet` : "N/A" : item?.landing_distance_meters > 0 ? `${numeral(item?.landing_distance_meters).format("0,0")} meters` : "N/A")}

            {statDisplay("sack-dollar", "Annual Fixed Costs", currencySymbol + numeral(item[`${regionPrefix}_annual_total`] * conversionRate).format("0,0"))}

            {statDisplay("sack-dollar", "Hourly Cost", currencySymbol + numeral(item[`${regionPrefix}_hourly_total`] * conversionRate).format("0,0"))}

            {statDisplay("shopping-cart", "Price (New)", currencySymbol + numeral(item?.new_purchase * conversionRate).format("0,0"))}

            {statDisplay("shopping-cart", "Average Pre-Owned", currencySymbol + numeral(item?.average_pre_owned * conversionRate).format("0,0"))}

            {statDisplay("clock", "Years Produced", item?.production_start > 0 ? `${item?.production_start} - ${item?.production_end}` : "N/A")}
          </div>
          <div
            className={styles.bid}
            dangerouslySetInnerHTML={{ __html: item?.count }}
          />
        </div>
      </Link>
    </div>
  );
};

export default Card;
