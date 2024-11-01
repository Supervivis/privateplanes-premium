import SingleAircraftDetails from "../SingleAircraft/SingleAircraftDetails";

const Subscription = () => {
  return (
    <SingleAircraftDetails
      aircraftID={805}
      allowComparison={false}
      showSimilarAircrafts={false}
      byPassAuth
    />
  );
};

export default Subscription;
