import React from "react";
import change_arrow_up from "../../../assets/change_arrow_up.png";
import change_arrow_down from "../../../assets/change_arrow_down.png";
import cn from "classnames";
import styles from "./fbp.module.scss"

const FlightsByPeriodCard = ({ icon, title, flights, flights_change, hours, hours_change }) => {
  return (
    <div className="card p-6">
      <div className="flex justify-center md:justify-start items-center gap-2">
        <div className="py-1 px-2 rounded-md bg-[#F4F5F5] text-xl md:text-2xl text-[#9E9FA4]">{icon}</div>
        <h3>{title}</h3>
      </div>

      <div className="flex justify-center md:justify-start items-center gap-4 mt-4">
        <h2 className={cn(styles.main_title)}>
          {flights ? Intl.NumberFormat('en-US').format(flights) : <i className="fa fa-spinner fa-spin text-6xl"></i>}
        </h2>
        
        {flights_change &&
          <div className={cn(styles.change_text, `${flights_change >= 0 ? "positiveChange" : "negativeChange"} change`)}>
            {flights_change}%
            <img className={cn(styles.change_img)} src={flights_change > 0 ? change_arrow_up: change_arrow_down} />
          </div>
        }
      </div>

      {/*
      <div className="flex justify-center md:justify-start items-center gap-4 mt-4">
        <h3 className={cn(styles.secondary_title)}>
          {Intl.NumberFormat('en-US').format(hours)}&nbsp;hours
        </h3>
        <div className={cn(styles.change_text, `${flights_change >= 0 ? "positiveChange" : "negativeChange"} change`)}>
          {hours_change}%
          <img className={cn(styles.change_img)} src={`/change_arrow_${flights_change >= 0 ? "up" : "down"}.png`} />
        </div>
      </div>
      */}
    </div>
  );
};

export default FlightsByPeriodCard;