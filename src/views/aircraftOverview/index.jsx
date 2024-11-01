import React from "react";

import FlightActivityCard from "../../components/aircraftLookup/activityByTypeCard";
import BasicTableCard from "../../components/aircraftLookup/basicTableCard";

import HealthScoreCard from "../../components/shared/healthScoreCard/index";
import BasicRowsCard from "../../components/shared/basicRowsCard";
import MapWithChart from "../../components/shared/mapWithChart";
import InsightsCard from "../../components/shared/insightsCard";

import { dataForFirstChart, optionsForFirstChart, mapDataThree, mapDataLiveFlights, transactionHistory, accidentHistory } from "./sampleData";
import DonutChartCard from "../../components/shared/donutCard";

export default function AircraftOverview() {

  return (
  <div className="w-100 py-8 px-4 md:px-8 flex flex-col md:gap-6 gap-8">

    <div className="grid md:grid-cols-3 md:gap-6 gap-8">
      <BasicRowsCard 
        titleOne="Production Start" contentOne="2012"
        titleTwo="Production End" contentTwo="2015"
        titleThree="In Production?" contentThree="Yes"
      />

      <BasicRowsCard 
        titleOne="Number In Service" contentOne="212"
        titleTwo="Number on Market" contentTwo="21"
        titleThree="Avg Days on Market" contentThree="245"
      />

      <BasicRowsCard 
        titleOne="Avg Annual Hours" contentOne="4,500"
        titleTwo="Avg Mission Length" contentTwo="1.5 hours"
        titleThree="Avg Mission Distance" contentThree="3,500 nm"
      />
    </div>

    <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
      <HealthScoreCard
        donutOneTitle="Overall score" donutOnePercent={70}
        donutTwoTitle="Hours score" donutTwoPercent={20}
        donutThreeTitle="Transaction History" donutThreePercent={50}
        donutFourTitle="Accident History" donutFourPercent={100}
        alertOneType="positive" alertOneContent="Aircraft hours occur regularly with no significant down periods"
        alertTwoType="alert" alertTwoContent="Aircraft has been flown to airports with suspicious links "
        alertThreeType="warning" alertThreeContent="Aircraft has an accident recorded as a fatality and total loss"
      />

      <InsightsCard />
    </div>

    <div className="flex gap-6 md:gap-8">
      <FlightActivityCard />

      <DonutChartCard
        title="Departures by Region"
        data={dataForFirstChart}
        options={optionsForFirstChart}
      />
    </div>

    <MapWithChart 
      title="Routes"
      data={mapDataLiveFlights}
      additional={1292}
      type="Routes"
    />

    <div className="flex gap-6 md:gap-8">
      <div className="card shrink-0">        
        <BasicTableCard
          title="Transaction History"
          data={transactionHistory}
        />
      </div>

      <div className="card flex-grow">
        <BasicTableCard
          title="Accident History"
          data={accidentHistory}
        />
      </div>
    </div>

    <MapWithChart 
      title="Top Locations"
      data={mapDataThree}
    />
  </div>
  );
}
