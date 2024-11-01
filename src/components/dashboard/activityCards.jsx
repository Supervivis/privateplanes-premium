import React, {useState, useEffect} from "react";
import FlightsByPeriodCard from "./flightByPeriodCard";
import apiService from "../../services/api";

const ActivityCards = () => {
  const [flightsByPeriod, setFlightsByPeriod] = useState([]); 

  useEffect(() => {
    async function fetchData() {
      const response = await apiService.getFlightsByPeriod();
      setFlightsByPeriod(response);
    }
    fetchData();
  }, []);

  return (
    <div className="grid md:grid-cols-3 md:gap-6 gap-8">
      <FlightsByPeriodCard 
        icon={<i className="fa-solid fa-gear"></i>}
        title="Flights Today"
        flights={flightsByPeriod.counts ? flightsByPeriod.counts.last_day : null}
        flights_change={flightsByPeriod.changes ? flightsByPeriod.changes.change_day.toFixed(1) : null}
        hours={12570}
        hours_change={7.7} 
      />

      <FlightsByPeriodCard 
        icon={<i className="fa-regular fa-calendar-check"></i>}
        title="Flights this Week"
        flights={flightsByPeriod.counts ? flightsByPeriod.counts.last_week : null}
        flights_change={flightsByPeriod.changes ? flightsByPeriod.changes.change_week.toFixed(1) : null}
        hours={18570}
        hours_change={12.7} 
      />

      <FlightsByPeriodCard 
        icon={<i className="fa-solid fa-clock-rotate-left"></i>}
        title="Flights Past 30 Days"
        flights={flightsByPeriod.counts ? flightsByPeriod.counts.last_month : null}
        flights_change={flightsByPeriod.changes ? flightsByPeriod.changes.change_month.toFixed(1) : null}
        hours={46570}
        hours_change={-7.7} 
      />
    </div>
  );
}

export default ActivityCards;