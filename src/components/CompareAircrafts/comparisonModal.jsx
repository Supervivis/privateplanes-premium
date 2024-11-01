import React, { useState, useEffect, useContext, useRef } from "react";
import { StateContext } from "../../context";

const ComparisonModal = ({currentIds}) => {
  console.log(currentIds)
  const [modalOpen, setModalOpen] = useState(false);
  const { allAircraftData } = useContext(StateContext);
  const [aircraftData, setAircraftData] = useState([]);
  const [selectedAircrafts, setSelectedAircrafts] = useState([]);
  const [selectedAircraftIds, setSelectedAircraftIds] = useState([]);
  const [filteredAircrafts, setFilteredAircrafts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      const response = await allAircraftData();
      console.log(response)
      setAircraftData(response);
    }
    fetchData();

    document.addEventListener('mousedown', closeModalOnClickOutside);
    return () => {
      document.removeEventListener('mousedown', closeModalOnClickOutside);
    };
  }, []);

  useEffect(() => {
    search === "" 
      ? setFilteredAircrafts(aircraftData) 
      : setFilteredAircrafts(aircraftData.filter((aircraft) => aircraft.aircraft_name.toLowerCase().includes(search.toLowerCase())));

    if (currentIds && aircraftData) {
      const newAircrafts = [];
      const newAircraftIds = [];
  
      currentIds.forEach((id) => {
        const aircraft = aircraftData.find((aircraft) => aircraft.id === parseInt(id));
        console.log(id, aircraft, aircraftData);
        if (aircraft && !selectedAircraftIds.includes(aircraft.id)  ) {
          console.log("Adding aircraft", aircraft.id);
          newAircrafts.push(aircraft);
          newAircraftIds.push(aircraft.id);
        }
      });
  
      setSelectedAircrafts((prevSelectedAircrafts) => [...prevSelectedAircrafts, ...newAircrafts]);
      setSelectedAircraftIds((prevSelectedAircraftIds) => [...prevSelectedAircraftIds, ...newAircraftIds]);
    }
  }, [search, aircraftData, currentIds]);

  const handleAircraftSelection = (aircraft) => {
    if (selectedAircraftIds.includes(aircraft.id)) {
      setSelectedAircrafts(selectedAircrafts.filter((selectedAircraft) => selectedAircraft.id !== aircraft.id));
      setSelectedAircraftIds(selectedAircraftIds.filter((id) => id !== aircraft.id));
    }
    else {
      setSelectedAircrafts([...selectedAircrafts, aircraft]);
      setSelectedAircraftIds([...selectedAircraftIds, aircraft.id]);
    }
  }

  useEffect(() => {
    console.log(selectedAircraftIds);
  }, [selectedAircraftIds]);

  const modalRef = useRef();
  const closeModalOnClickOutside = (event) => modalRef.current && !modalRef.current.contains(event.target) && setModalOpen(false);

  return (
    <>
      <button className="py-2 px-4 bg-[#02042c] text-white rounded-md" onClick={() => setModalOpen(true)}>
        Compare
      </button>
  
      {modalOpen && (
        <div className="modal-container">
          <div className="card max-h-[80vh] w-full comparison-modal overflow-scroll" ref={modalRef}>
            <h3 className="text-center">Aircraft Comparison</h3>
            <p className="text-center">You can compare up to 3 aircrafts</p>

            <div className="grid grid-cols-3 gap-4 mt-12 mb-4">
              {[0, 1, 2].map((index) => {
                return (
                  <div key={index} className="relative border-2 border-[#02042c] p-6 rounded-xl h-full">
                    {selectedAircrafts[index] && (
                      <>
                        <img src={selectedAircrafts[index].aircraft_image} alt={selectedAircrafts[index].aircraft_name} />
                        <p>{selectedAircrafts[index].aircraft_name}</p>
                        <button 
                          className="aircraft-compare-remove"
                          onClick={() => {
                            setSelectedAircrafts(selectedAircrafts.filter((aircraft) => aircraft.id !== selectedAircrafts[index].id))
                            setSelectedAircraftIds(selectedAircraftIds.filter((id) => id !== selectedAircrafts[index].id))
                          }}
                        >
                        <i class="fa-solid fa-xmark"></i>
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <a href={`/compare?aircrafts=${selectedAircraftIds.join(",")}`}>
              <button
                className="py-2 px-4 bg-[#02042c] text-white rounded-lg w-full"
                onClick={() => setModalOpen(!modalOpen)}
                disabled={selectedAircrafts.length < 2}
              >
                Compare
              </button>
            </a>
            

            {selectedAircrafts.length < 3 && (
              <>
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Aircraft" 
                  className="filter_input w-full mt-6" 
                />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {filteredAircrafts.map((aircraft) => {
                    return (
                      <div 
                        key={aircraft.id} 
                        onClick={() => handleAircraftSelection(aircraft)}
                        className={`${selectedAircraftIds.includes(aircraft.id) ? "border-2 border-[#02042c]" : "not in"} p-4 cursor-pointer bg-[#fafafa] hover:bg-[#f2f2f2] rounded-xl text-sm`}
                      >
                        <img src={aircraft.aircraft_image} alt={aircraft.aircraft_name} />
                        <p className="mt-2">{aircraft.aircraft_name}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )

}

export default ComparisonModal;