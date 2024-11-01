import cn from "classnames";
import global from "../styles/global.module.scss";
import numeral from "numeral";
import { GoogleMap, Circle, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";

import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import styles from "./styles/styles.module.scss";

const RangeMap = ({ params }) => {
  const [latLng, setLatLong] = useState({ lat: 37.772, lng: -80 });
  const [address, setAddress] = useState("");
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);

  const decreasePerPassengerNauticalMiles = params.range_decrease_per_passenger;
  const decreasePerPassengerMiles = params.range_decrease_per_passenger * 1.15078;
  const decreasePerPassengerKm = params.range_decrease_per_passenger * 1.852;
  const maxNumberOfPassengers = params.max_pax;
  const rangeNauticalMiles = params.range_NM;
  const rangeMiles = params.range_Miles;
  const rangeKm = params.range_km;

  function handleChange(address) {
    setAddress(address);
  }

  function handleSelect(address) {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => setLatLong(latLng))
      .catch((error) => console.error("Error", error));
  }

  var options = {
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: (rangeKm - (numberOfPassengers * decreasePerPassengerKm)) * 1000,
    zIndex: 1,
  };

  //console.log(options)

  return (
    <div className="card no-padding">
      <div className="flex">
        <LoadScript
          id="script-loader"
          googleMapsApiKey="AIzaSyBoq4qT-mCxXcn5Mx77PAYVWXriJrVEY9A"
          libraries={["places"]}
        >
          <div className="py-6 px-6 md:px-12 flex flex-col justify-between">
            <h3 className="text-3xl">Range Map</h3>
            <PlacesAutocomplete
              value={address}
              onChange={handleChange}
              onSelect={handleSelect}
            >
              {({
                getInputProps,
                suggestions,
                getSuggestionItemProps,
                loading,
              }) => (
                <div className={styles.range_configs}>
                  <div className={cn(styles.map_inputs, global.pdf_hidden, "flex flex-col items-center")}>
                    <label htmlFor="paxNumber" className={styles.pax_slider}>
                      Pax number
                      <Slider
                        valueLabelDisplay="auto"
                        aria-label="Volume"
                        value={numberOfPassengers}
                        max={maxNumberOfPassengers}
                        onChange={(e, newValue) => setNumberOfPassengers(newValue)}
                      />
                    </label>
                    
                    <label htmlFor="startLocation">
                      <TextField
                        {...getInputProps({
                          placeholder: "Start location",
                          className: "location-search-input",
                        })}
                        id="startLocation"
                        label="Start Location"
                        variant="standard"
                      />
                    </label>
                  </div>
                  <div className="autocomplete-dropdown-container">
                    {loading && <div>Loading...</div>}
                    {suggestions.map((suggestion) => {
                      const className = suggestion.active
                        ? "suggestion-item--active"
                        : "suggestion-item";
                      // inline style for demonstration purpose
                      const style = suggestion.active
                        ? { backgroundColor: "#fafafa", cursor: "pointer" }
                        : { backgroundColor: "#ffffff", cursor: "pointer" };
                      return (
                        <div
                          {...getSuggestionItemProps(suggestion, {
                            className,
                            style,
                          })}
                        >
                          <span>{suggestion.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </PlacesAutocomplete>

            <table className="table-auto">
              <tbody>
                <tr>
                  <td className="pb-6">Range (Nautical Miles)</td>
                  <td className="pl-4 md:pl-8 pb-6 font-bold text-lg">{numeral(rangeNauticalMiles).format("0,0")}</td>
                </tr>
                <tr>
                  <td className="pb-6">Range (Miles)</td>
                  <td className="pl-4 md:pl-8 pb-6 font-bold text-lg">{numeral(rangeMiles).format("0,0")}</td>
                </tr>
                <tr>
                  <td className="pb-6">Adjusted Range (Nautical Miles)</td>
                  <td className="pl-4 md:pl-8 pb-6 font-bold text-lg">{numeral(rangeNauticalMiles - (numberOfPassengers * decreasePerPassengerNauticalMiles)).format("0,0")}</td>
                </tr>
                <tr>
                  <td className="pb-2">Adjusted Range (Miles)</td>
                  <td className="pl-4 md:pl-8 font-bold text-lg">{numeral(rangeMiles - (numberOfPassengers * decreasePerPassengerMiles)).format("0,0")}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex-grow h-full">
            <GoogleMap
              zoom={2}
              center={latLng}
              options={{
                streetViewControl: false,
                fullscreenControl: false,
                mapTypeControl: false,
              }}
              mapContainerClassName="map-container"
              mapContainerStyle={{ height: 700 + "px" }}
            >
              <Circle center={latLng} options={options} />
              <Marker position={latLng} />
            </GoogleMap>
          </div>

        </LoadScript>
      </div>
    </div>
  );
}

export default RangeMap;