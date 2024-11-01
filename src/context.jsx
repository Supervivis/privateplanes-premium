import React, {useState, useEffect} from "react";
import apiService from "./services/api";
import Axios from "axios";
const StateContext = React.createContext();

const StateProvider = ({children}) => {
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [numLiveFlights, setNumLiveFlights] = useState(0);
  const [currencyConversionRates, setCurrencyConversionRates] = useState({});
  const toggleSidenav = () => setIsSidenavOpen(!isSidenavOpen);

  const openExchangeApiKey = "eecccea188d04b28b2c88833eb26109d"

  useEffect(() => {
    async function fetchData() {
      const response = await apiService.getLiveFlights();
      setNumLiveFlights(response.data.length);
    }
    fetchData();
  }, []);

  const getCurrencyConversion = async (currency) => {
    console.log(currency);
    if (currencyConversionRates[currency]) {
      console.log("A");
      return currencyConversionRates[currency];
    }
    else if (currency === "USD") {
      console.log("B")
      return 1;
    }
    else {
      console.log("C")
      const response = await Axios.get(`https://openexchangerates.org/api/latest.json?app_id=${openExchangeApiKey}`);
      let conversionRate = response.data.rates[currency];
      console.log(conversionRate)
      setCurrencyConversionRates({...currencyConversionRates, [currency]: conversionRate})
      return conversionRate;
    }
  }
  
  const allAircraftData = async () => {
    // Check if aircraft data is set in local storage
    const aircraftData = JSON.parse(localStorage.getItem("aircraftData"));

    if (aircraftData) return aircraftData;
    else {
      const response = await apiService.getAircrafts();
      localStorage.setItem("aircraftData", JSON.stringify(response.data));
      return response.data;
    }
  }

  return (
    <StateContext.Provider value={{isSidenavOpen, toggleSidenav, numLiveFlights, setNumLiveFlights, allAircraftData, getCurrencyConversion}}>
      {children}
    </StateContext.Provider>
  );
}

export {StateContext, StateProvider};