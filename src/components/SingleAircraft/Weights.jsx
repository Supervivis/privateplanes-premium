import numeral from "numeral";
import { useEffect, useState } from "react";

import StatsWithDivider from "./statsWithDivider";

const Weights = ({ params, unit, title }) => {
  const [weightPrefix, setWeightPrefix] = useState("");

  useEffect(() => {
    setWeightPrefix(unit === "Imperial Units" ? "lbs" : "kgs"); 
  }, [unit]);

  return (
    <div className="card">
      <h3 className="text-3xl">Weights</h3>

      <div className="flex flex-col md:items-center gap-8">
        <StatsWithDivider
          statOneTitle={`Max Take-Off Weight (${weightPrefix})`} statOneContent={numeral(params[`MTOW_${weightPrefix}`]).format("0,0")}

          statTwoTitle={`Max Landing Weight (${weightPrefix})`} statTwoContent={numeral(params[`max_landing_weight_${weightPrefix}`]).format("0,0")}

          statThreeTitle={`Available Fuel (${weightPrefix})`} statThreeContent={numeral(params[`available_fuel_${weightPrefix}`]).format("0,0")}

          statFourTitle={`Basic Operating Weight (${weightPrefix})`} statFourContent={numeral(params[`basic_operating_weight_${weightPrefix}`]).format("0,0")}

          statFiveTitle={`Max Ramp Weight (${weightPrefix})`} statFiveContent={numeral(params[`max_ramp_weight_${weightPrefix}`]).format("0,0")}

          statSixTitle={`Available Fuel (${weightPrefix})`} statSixContent={numeral(params[`available_fuel_${weightPrefix}`]).format("0,0")}

          statSevenTitle={`Useful Payload (${weightPrefix})`} 
          statSevenContent={weightPrefix === "lbs" 
            ? numeral(params.useful_load_lbs).format("0,0")
            : numeral(params.useful_payloads_kgs).format("0,0")
          }

          statEightTitle={`Baggage Weight (${weightPrefix})`} statEightContent={numeral(params[`baggage_weight_${weightPrefix}`]).format("0,0")}
        />

        <div>
          <h4 className="font-bold">
            Baggage Capacity{" "}
            {unit === "Imperial Units" ? "(Cubic Feet)" : "(Cubic Meters)"}
          </h4>

          <div className="flex justify-center mt-6 gap-6">
            <div className="text-center">
              <p className="font-bold">Total</p>
              <p>{params[`baggage_capacity_${unit === "Imperial Units" ? "CF" : "cubicmeters"}`]}</p>
            </div>

            <div className="text-center">
              <p className="font-bold">Internal</p>
              <p>{params[`internal_baggage_${unit === "Imperial Units" ? "CF" : "cubicmeters"}`]}</p>
            </div>

            <div className="text-center">
              <p className="font-bold">External</p>
              <p>{params[`external_baggage_${unit === "Imperial Units" ? "CF" : "cubicmeters"}`]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weights;
