import cn from "classnames";
import styles from "./styles/styles.module.scss";
import { useState, useEffect } from "react";

const KeyFacts = ({ params }) => {
  const [view, setView] = useState("exterior");
  const toggleView = () => view === "interior" ? setView("exterior") : setView("interior");

  const [keyFacts, setKeyFacts] = useState([]);
  useEffect(() => {
    if (params.key_facts !== undefined) {
      setKeyFacts(params.key_facts.split("\n"));
    } else {
    }
  }, [params.key_facts]);

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      <div className="card">
        <div className="text-xl lg:text-6xl font-semibold">
          <h3>{params.aircraft_name}</h3>

          <h3>{params.production_start} - {params.production_end ? params.production_end : "Current"}</h3>
        </div>
        

        <ul className="list-outside ml-6 list-disc mt-8 text-lg md:text-xl xl:text-2xl">
          {keyFacts.map((fact, index) => {
            return <li key={index}>{fact}</li>;
          })}
        </ul>
      </div>

      <div className="card shrink-0 gap-4 flex-grow">
        <div className="flex justify-end">
          <button onClick={toggleView} className="interact_button">
            {view === "interior" ? "View Exterior" : "View Floorplan"}
          </button>
        </div>
        <img
          src={view === "interior" ? params.floorplan_drawing : params.aircraft_image}
          className={cn(styles.single_image)}
          alt=""
        />
      </div>
    </div>
  );
};

export default KeyFacts;
