import React, { useEffect, useState } from "react";
import api from "../../services/api";
import PaginatedTable from "../shared/paginatedTable";
import { getCountryFromRegistration } from "../../utils/constants/app-constants";
import numeral from "numeral";

const AllAircraftCard = ({ regNumbers }) => {
  const [aircraftData, setAircraftData] = useState([]);
  const [regSearch, setRegSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [filteredData , setFilteredData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await api.getFleetData(`reg=${regNumbers}`);
      console.log(response.data);
      let formattedData = response.data.map((item) => {
        return {
          "Registration": item.reg,
          "Serial_Number": item.serial_number === "" ? "N/A" : `${item.serial_number}`,
          "Country": getCountryFromRegistration(item.reg),
          "Year": parseFloat(item.year) || 0,
          "Hours": numeral(item.hours).format("0,0") || "N/A",
          "Lookup": item.reg
        };
      }); 

      setFilteredData(formattedData);
      setAircraftData(formattedData);
      setFetched(true);
    }
    fetchData();
  }, []);

  useEffect(() => {
    regSearch === ""
      ? setFilteredData(aircraftData)
      : setFilteredData(aircraftData.filter((item) => item.Registration.toLowerCase().includes(regSearch.toLowerCase())));
  }, [regSearch]);

  return (
    <div className="card overflow-y-scroll flex flex-col gap-2 all-aircraft-card" >
      <div className="flex flex-col md:flex-row items-center md:justify-between mb-4">
        <h3>All Aircrafts</h3>
      
        <input
          type="text"
          placeholder="Search by Registration"
          className="filter_input"
          value={regSearch}
          onChange={(e) => setRegSearch(e.target.value)}
        />
      </div>

      {!fetched
        ? <div className="py-12 flex flex-col justify-center items-center">
            <i className="fa fa-spinner fa-spin text-6xl"></i>
            <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
          </div>
        : aircraftData.length === 0 
            ? <div className="py-12 flex flex-col justify-center items-center"> 
                <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
                <h3 className="text-xl mt-6">No Data Available.</h3>
              </div>
            : <PaginatedTable data={filteredData} allAircraft={true} />
      }
    </div>
  )
}

export default AllAircraftCard;