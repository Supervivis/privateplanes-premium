import axios from "axios";
import { API_URL } from "../utils/constants/app-constants";

class apiService { 
  async getAircraftByName(name) {
    const response = await axios.get(API_URL + "aircraft-by-name/" + name + "/");
    if (response.data === null) return;
    return response.data;
  }

  async getAircraftById(aircraft_id) {
    console.log(aircraft_id);
    const response = await axios.get(
      API_URL + "aircrafts/" + aircraft_id + "/"
    );
    console.log(API_URL + "aircrafts/" + aircraft_id + "/");

    if (response.data === null) return;
    console.log(response.data.aircraft);
    return response.data.aircraft;
  }

  async getAircrafts(additionalFilters) {
    const response = await axios.get(API_URL + "aircraft-items/" + (additionalFilters ? "?" + additionalFilters : ""));
    console.log(response.data);
    if (response.data === null) return;
    return response.data;
  }

  async getLiveFlights(additionalFilters) {
    const response = await axios.get(API_URL + "live-flights/" + (additionalFilters ? "?" + additionalFilters : ""));
    if (response.data === null) return;
    return response.data;
  }

  async getPrevious60DayFlights(additionalFilters) {
    const response = await axios.get(API_URL + "sixty-day-flight-history/" + (additionalFilters ? "?" + additionalFilters : ""));
    if (response.data === null) return;
    return response.data;
  }

  async getFlightsForPreviousYears(additionalFilters) {
    const response = await axios.get(API_URL + "flights-for-previous-years/" + (additionalFilters ? "?" + additionalFilters : ""));
    if (response.data === null) return;
    return response.data;
  }

  async getFlightsByPeriod() {
    const response = await axios.get(API_URL + "flights-by-period/");
    if (response.data === null) return;
    return response.data;
  }

  async getFlightsByContinent(timePeriod, additionalFilters) {
    const response = await axios.get(`${API_URL + "flights-by-continent/" + timePeriod + "/"}${additionalFilters ? "?" + additionalFilters : ""}`);
    if (response.data === null) return;
    return response.data;
  }

  async getFlightsByCategory(timePeriod){
    const response = await axios.get(API_URL + "flights-by-category/" + timePeriod + "/");
    if (response.data === null) return;
    return response.data;
  }

  async getFlightsByMake(timePeriod){
    const response = await axios.get(API_URL + "flights-by-make/" + timePeriod + "/");
    if (response.data === null) return;
    return response.data;
  }

  async getFlightsByDomesticVsInternational(timePeriod){
    const response = await axios.get(API_URL + "domestic-vs-int/" + timePeriod + "/");
    if (response.data === null) return;
    return response.data;
  }

  async getFlightHistory(additionalFilters){
    const response = await axios.get(`${API_URL + "flight-history/"}${additionalFilters ? "?" + additionalFilters : ""}`);
    if (response.data === null) return;
    return response.data;
  }

  async getFlightHoursHistory(additionalFilters){
    const response = await axios.get(`${API_URL + "flight-hours-history/"}${additionalFilters ? "?" + additionalFilters : ""}`);
    if (response.data === null) return;
    return response.data;
  }

  async getFlightDistanceHistory(additionalFilters){
    const response = await axios.get(`${API_URL + "flight-distance-history/"}${additionalFilters ? "?" + additionalFilters : ""}`);
    if (response.data === null) return;
    return response.data;
  }

  async getFlightsByMonthByYear({year}){
    const response = await axios.get(API_URL + "flights-by-month-for-year/" + year + "/");
    if (response.data === null) return;
    return response.data;
  }

  async getFlightsByAirport({timePeriod, additionalFilters}){
    console.log(additionalFilters)
    const response = await axios.get(`${API_URL + "flights-by-airport/" + timePeriod + "/"}${additionalFilters ? "?" + additionalFilters : ""}`);
    if (response.data === null) return;
    return response.data;
  }

  async getFlightsByCity({timePeriod, additionalFilters}){
    const response = await axios.get(`${API_URL + "flights-by-city/" + timePeriod + "/"}${additionalFilters ? "?" + additionalFilters : ""}`);
    if (response.data === null) return;
    return response.data;
  }

  async getFlightsByCountry({timePeriod, additionalFilters}){
    const response = await axios.get(`${API_URL + "flights-by-country/" + timePeriod + "/"}${additionalFilters ? "?" + additionalFilters : ""}`);
    if (response.data === null) return;
    return response.data;
  }

  async getTopRoutes(timePeriod, additionalFilters){
    const response = await axios.get(`${API_URL + "top-routes/" + timePeriod + "/"}${additionalFilters ? "?" + additionalFilters : ""}`);
    if (response.data === null) return;
    return response.data;
  }

  async getStockPrices(){
    const response = await axios.get(API_URL + "stock-prices/");
    if (response.data === null) return;
    return response.data;
  }

  async getLatestNews(){
    const response = await axios.get(API_URL + "latest-news/");
    if (response.data === null) return;
    return response.data;
  }

  async getRegistrations(timePeriod, additionalFilters){
    const response = await axios.get(`${API_URL + "registrations/"}${additionalFilters ? "?" + additionalFilters : ""}`);
    if (response.data === null) return;
    return response.data;
  }

  async getAccidents(timePeriod, additionalFilters){
    const response = await axios.get(`${API_URL + "accidents/"}${additionalFilters ? "?" + additionalFilters : ""}`);
    if (response.data === null) return;
    return response.data;
  }
  
  async lookupAircraft(registration){
    const response = await axios.get(API_URL + "aircraft-lookup/" + registration + "/");
    if (response.data === null) return;
    return response.data;
  }

  async getRegNumbersForAircraft(additionalFilters){
    const response = await axios.get(API_URL + "reg-numbers-for-aircraft/" + (additionalFilters ? "?" + additionalFilters : ""));
    if (response.data === null) return;
    return response.data;
  }

  async getFleetActivity(additionalFilters){
    const response = await axios.get(API_URL + "fleet-activity/" + (additionalFilters ? "?" + additionalFilters : ""));
    if (response.data === null) return;
    return response.data;
  }

  async getFleetData(additionalFilters){
    const response = await axios.get(API_URL + "fleet-data/" + (additionalFilters ? "?" + additionalFilters : ""));
    if (response.data === null) return;
    return response.data;
  }

  async getAvgAnnualHoursAndDistance(additionalFilters){
    const response = await axios.get(API_URL + "avg-annual-hours-and-distance/" + (additionalFilters ? "?" + additionalFilters : ""));
    if (response.data === null) return;
    return response.data;
  }

  async getLast12MonthsFlights(additionalFilters){
    const response = await axios.get(API_URL + "last-12-months-flights/" + (additionalFilters ? "?" + additionalFilters : ""));
    if (response.data === null) return;
    return response.data;
  }
  async getAIAircraftOverview(id, question){
    
   
    const response = await axios.get(API_URL + "ai-aircraft-overview/" + id + "/" + question, {responseType : 'stream'});
    // return response
    return response
  }
  async getAIIndustryHealth(additionalFilters){
    try{
      const response = await axios.get(API_URL + "ai-health-industry/" + (additionalFilters ? "?" + additionalFilters : ""))
      if(response.data == null)return;
      return response.data;
    }catch(error){
      throw error
    }
  }
  async getAIAircraftHealth(additionalFilters){
    const response = await axios.get(API_URL + "ai-health-aircraft/" + (additionalFilters ? "?" + additionalFilters : ""))
    if(response.data == null)return;
    return response.data;
  }
}

export default new apiService();
