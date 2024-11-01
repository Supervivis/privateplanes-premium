import React from "react";
import cn from "classnames";
import styles from "./styles/styles.module.scss";
import { useState, useEffect } from "react";

const KeyFacts = ({ data, comparisonIds }) => {
  console.log(comparisonIds.filter((id) => id !== `753`).join(","))
  const [aircraftsData, setAircraftsData] = useState(data);
  const [keyFacts0, setKeyFacts0] = useState([]);
  const [keyFacts1, setKeyFacts1] = useState([]);
  const [keyFacts2, setKeyFacts2] = useState([]);

  useEffect(() => {
    if (aircraftsData[0] !== undefined) {
      setKeyFacts0(aircraftsData[0].key_facts.split("\n"));
      setKeyFacts1(aircraftsData[1].key_facts.split("\n"));
      if (aircraftsData[2] !== undefined) {
        setKeyFacts2(aircraftsData[2].key_facts.split("\n"));
      }
    } 
  }, [data[2]]);

  return (
    <div className="card">
      <h3 className="text-3xl">Key Facts</h3>

      <div className={`mt-8 grid lg:grid-cols-${aircraftsData.length}`}>
        {aircraftsData.map((aircraft, index) => {
          return (
            <div className={`flex flex-col items-center gap-8 px-4 lg:px-6 ${index < (aircraftsData.length - 1) ? "border-r border-black" : ""}`} key={aircraft.aircraft_id}>
              <h4 className="text-xl font-bold">{aircraft.aircraft_name}</h4>

              {aircraftsData.length > 2 && 
                <a href={`/compare?aircrafts=${comparisonIds.filter((id) => id !== `${aircraft.id}`).join(",")}`}>
                  <button className={cn(styles.btn)} >
                    Remove Aircraft
                  </button>
                </a>
              }
              
              <div className={cn(styles.image_container)}>
                {/* <img src={aircraft.image_name} alt="" /> */}
                <img src={aircraft.aircraft_image} alt={aircraft.aircraft_name} />
              </div>
              <ul className="list-inside list-disc text-lg">
                {index === 0
                  ? keyFacts0.map((fact, index) => {
                      return <li key={index}>{fact}</li>;
                    })
                  : index === 1
                  ? keyFacts1.map((fact, index) => {
                      return <li key={index}>{fact}</li>;
                    })
                  : keyFacts2.map((fact, index) => {
                      return <li key={index}>{fact}</li>;
                    })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default KeyFacts;
