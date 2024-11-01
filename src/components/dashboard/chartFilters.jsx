import React, { useState, useEffect } from "react";
import { FILTER_OPTIONS } from "../../utils/constants/app-constants";

const ChartFilters = ({ setApiFilters }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [classFilters, setClassFilters] = useState([]);
  const [makeFilters, setMakeFilters] = useState([]);
  const [modelFilters, setModelFilters] = useState([]);
  const [filterIsActive, setFilterIsActive] = useState(false);

  // Dynamically calculate the unique options based on selected filters
  const getFilteredOptions = () => {
    const filteredOptions = FILTER_OPTIONS.filter(item =>
      (classFilters.length === 0 || classFilters.includes(item.class)) &&
      (makeFilters.length === 0 || makeFilters.includes(item.make)) &&
      (modelFilters.length === 0 || modelFilters.includes(item.model))
    );

    return {
      uniqueMakes: [...new Set(filteredOptions.map(item => item.make))],
      uniqueModels: [...new Set(filteredOptions.map(item => item.model))],
      uniqueClasses: [...new Set(filteredOptions.map(item => item.class))]
    };
  };

  const { uniqueMakes, uniqueModels, uniqueClasses } = getFilteredOptions();

  const handleClassFilterChange = (selectedClass) => {
    setClassFilters(prevFilters =>
      prevFilters.includes(selectedClass)
        ? prevFilters.filter(filter => filter !== selectedClass)
        : [...prevFilters, selectedClass]
    );
  };

  const handleMakeFilterChange = (selectedMake) => {
    setMakeFilters(prevFilters =>
      prevFilters.includes(selectedMake)
        ? prevFilters.filter(filter => filter !== selectedMake)
        : [...prevFilters, selectedMake]
    );
  };

  const handleModelFilterChange = (selectedModel) => {
    setModelFilters(prevFilters =>
      prevFilters.includes(selectedModel)
        ? prevFilters.filter(filter => filter !== selectedModel)
        : [...prevFilters, selectedModel]
    );
  };

  useEffect(() => {
    const createQueryString = (params) => {
      return params
        .map(param => param.values.map(value => `${param.key}=${encodeURIComponent(value)}`).join('&'))
        .join('&');
    };

    const selectedFilters = [
      { key: 'class', values: classFilters },
      { key: 'make', values: makeFilters },
      { key: 'model', values: modelFilters }
    ].filter(param => param.values.length > 0);

    const queryString = createQueryString(selectedFilters);

    setFilterIsActive(queryString.length > 0);
    setApiFilters(queryString);
  }, [classFilters, makeFilters, modelFilters]);

  const resetFilters = () => {
    setClassFilters([]);
    setMakeFilters([]);
    setModelFilters([]);
    setFilterIsActive(false);
    setIsDropdownVisible(false);
  };

  return (
    <div className="relative">
      <div className={`${filterIsActive ? "filter-active" : ""} interact_button`}onClick={() => setIsDropdownVisible(!isDropdownVisible)}>
        <i className="fa-solid fa-filter"></i>
        <p>Filter</p>
      </div>

      {isDropdownVisible && (
        <div className="card dropdown-menu rounded-md">
          <div className="flex">
            <div>
              <div className="whitespace-nowrap">
                <h4 className="border-b-2 border-[#F3F5F9] px-4 text-xl whitespace-nowrap mb-2">Filter by Class</h4>
                {uniqueClasses.map((option, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg py-1 mb-1 mr-1 pl-4 ${classFilters.includes(option) ? 'bg-gray-200' : ''}`}
                    onClick={() => handleClassFilterChange(option)}
                  >
                    <h5>{option}</h5>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="whitespace-nowrap">
                <h4 className="border-b-2 border-[#F3F5F9] px-4 text-xl whitespace-nowrap mb-2">Filter by Make</h4>
                <div className="options-list">
                  {uniqueMakes.map((option, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer rounded-lg py-1 mb-1 mr-1 pl-4 ${makeFilters.includes(option) ? 'bg-gray-200' : ''}`}
                      onClick={() => handleMakeFilterChange(option)}
                    >
                      <h5>{option}</h5>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="whitespace-nowrap">
                <h4 className="border-b-2 border-[#F3F5F9] px-4 text-xl whitespace-nowrap mb-2">Filter by Model</h4>
                <div className="options-list">
                  {uniqueModels.map((option, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer rounded-lg py-1 mb-1 mr-1 pl-4 ${modelFilters.includes(option) ? 'bg-gray-200' : ''}`}
                      onClick={() => handleModelFilterChange(option)}
                    >
                      <h5>{option}</h5>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {filterIsActive && (
            <div className="w-full flex justify-end mt-2">
              <button
                className="py-2 px-4 bg-[#02042c] text-white rounded-md"
                onClick={() => resetFilters()}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChartFilters;