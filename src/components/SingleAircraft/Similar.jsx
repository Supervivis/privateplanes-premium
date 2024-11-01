import cn from "classnames";
import styles from "./styles/styles.module.scss";
import { Link } from "react-router-dom";

const Similar = ({ params }) => {
  console.log(params);

  return (
  <>
    {params?.length && 
      <div className="card">
        <h3 className="text-3xl">Similar Aircraft</h3>
        <main className={cn(styles.similar)}> 
          {(params.map((aircraft) => (
            <Link to={`/aircraft?id=${aircraft.id}`}>
              <div key={aircraft.aircraft_id} className={cn(styles.suggestion)}>
                <div className={cn(styles.image_container)}>
                  {/* <img src={`${aircraft?.image_name}`} alt="" /> */}
                  <img src={aircraft.aircraft_image} alt="" />
                </div>
                <h5>{aircraft.aircraft_name}</h5>
              </div>
            </Link>
          )))}
      </main>
    </div>
    }
  </>
  );
};

export default Similar;
