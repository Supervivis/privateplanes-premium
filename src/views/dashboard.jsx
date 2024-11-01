import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Search.module.scss";

import ActivityCards from "../components/dashboard/activityCards";
import ActivityByTypeCard from "../components/dashboard/activityByType";
import FlightHistoryCard from "../components/dashboard/flightHistory";
import TopLocations from "../components/dashboard/topLocations";
import LiveFlightsCard from "../components/dashboard/liveFlights";
import HealthScoreCard from "../components/shared/healthScoreCard";
import RecentNews from "../components/dashboard/recentNews";
import SimpleTableCard from "../components/shared/simpleTableCard";
import TopRoutes from "../components/shared/topRoutes";
import DonutChartCard from "../components/shared/donutCard";
import Dropdown from "../components/common/Dropdown";
import useGetIndustryHealth from '../custom-hooks/useGetIndustryHealth'
const timePeriodOptions = {
  "Today": 1,
  "Last 7 Days": 7,
  "Last 30 Days": 30
};

export default function Dashboard() {
  const [timePeriod, setTimePeriod] = useState(30);
  const [newsItemHeight, setNewsItemHeight] = useState(0);
  const parentRef = useRef(null);
  const health = useGetIndustryHealth();
  useEffect(() => {
    const updateHeight = () => {
      if (parentRef.current) {
        setNewsItemHeight(parentRef.current.offsetHeight);
      }
    };

    updateHeight(); // Update height on component mount

    window.addEventListener('resize', updateHeight); // Update height on window resize

    return () => window.removeEventListener('resize', updateHeight); // Clean up
  }, []);

  const handleChange = (option) => {
    const numericValue = timePeriodOptions[option];
    setTimePeriod(numericValue);
  };

  useEffect(() => {
    const contentContainer = document.getElementById('content-container');
    if (contentContainer) contentContainer.scrollTo(0, 0);
  }, []);
  

  return (
  <>
    <div className="w-full flex justify-center">
      <Dropdown
        className={styles.dropdown}
        headerDropdown={true}
        value={Object.keys(timePeriodOptions).find(key => timePeriodOptions[key] === timePeriod)}
        setValue={handleChange}
        options={Object.keys(timePeriodOptions)}
      />
    </div>

    <ActivityCards />

    <div className="grid lg:grid-cols-2 md:gap-6 gap-8">
      <div className="grid md:grid-cols-2 md:gap-6 gap-8 order-1">
        <DonutChartCard
          title="Departures by Region"
          apiRoute="getFlightsByContinent"
          timePeriod={timePeriod}
        />

        <DonutChartCard
          title="Flights by Aircraft Class"
          apiRoute="getFlightsByCategory"
          timePeriod={timePeriod}
        />
      </div>

      <div className="flex lg:order-3">
        <HealthScoreCard
          donutOneTitle="Current Health" donutOnePercent={health.health_score}
          donutTwoTitle="Future outlook" donutTwoPercent={health.future_score}
          donutThreeTitle="Market stability" donutThreePercent={health.stability_score}
          donutFourTitle="Flight activity" donutFourPercent={health.activity_score}
          alertOneType="positive" alertOneContent="Flight activity has been increasing every year at over 10%"
          alertTwoType="alert" alertTwoContent="Increase in number of aircraft coming to market"
          alertThreeType="warning" alertThreeContent="Economic concerns and increase in fuel prices may impact future activity"
          defaultText="What has happened of note within the private aviation industry within the past 7 days? Tell me about any relevant news, what the flight activity has been like, and what your predictions are for the future of the industry."
          additionalClasses="col-span-2"
          ai_endpoint={'ai-industry-overview/'}
        />

      </div>

      <div className="grid md:grid-cols-2 md:gap-6 gap-8 order-2 lg:order-3" ref={parentRef}>
        <DonutChartCard
          title="Flights by Manufacturer"
          apiRoute="getFlightsByMake"
          timePeriod={timePeriod}
          setNewsMaxHeight={setNewsItemHeight}
        />

        <DonutChartCard
          title="Domestic Vs International"
          apiRoute="getFlightsByDomesticVsInternational"
          timePeriod={timePeriod}
        />
      </div>

      <RecentNews maxHeight={newsItemHeight} />
    </div>

    <LiveFlightsCard />

    <div className="grid grid-cols-1 lg:grid-cols-5 md:gap-6 gap-8">
      <div className="lg:col-span-3 md:gap-6 gap-8 flex flex-col">
        <FlightHistoryCard />
        <ActivityByTypeCard />
      </div>
      
      <div className="lg:col-span-2 md:gap-6 gap-8 flex flex-col">
        {/*<InsightsCard />*/}
        <SimpleTableCard
          title="Recent Transactions"
          apiRoute="getRegistrations"
          timePeriod={timePeriod}
        />
        
        <SimpleTableCard
          title="Company Stock"
          apiRoute="getStockPrices"
          timePeriod={timePeriod}
        />
      </div>

    </div>

    <TopRoutes timePeriod={timePeriod} /> 
    <TopLocations timePeriod={timePeriod} />
  </>
  );
}