import React, {useEffect, useState} from 'react';
import { FORMAT_DATE } from '../../../utils/constants/app-constants';
import numeral from "numeral";
import cn from "classnames";
import styles from "./styles.module.scss"
import change_arrow_up from "../../../assets/change_arrow_up.png";
import change_arrow_down from "../../../assets/change_arrow_down.png";
import MiniTableChart from '../miniTableChart';

const PaginatedTable = ({ data, additional, type, includeChart, allAircraft, additionalFilters, yearOnYearOverride }) => {
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const [activeSort, setActiveSort] = useState({ header: "", dir: "" });

  useEffect(() => {
    console.log(additionalFilters)
  }, [additionalFilters]);

  const formatCell = (header, value) => {
    if (header === "change") {
      const changeClass = cn(styles.change_text, `${value >= 0 ? "positiveChange" : "negativeChange"} change`);
      return (
      <td key={header} className="px-0">
        <div className="flex justify-center">
          <div className={changeClass}>
            {numeral(value).format("0,0.0")}%
            {value !== 0 && <img src={value < 0 ? change_arrow_down : change_arrow_up} alt="" />}
          </div>
        </div>
      </td>
      );
    } else if (header === "price") {
      return (<td key={header}>${Intl.NumberFormat('en-US').format(value)}</td>);
    } else if (header === "movements") {
      return (<td key={header}>{Intl.NumberFormat('en-US').format(value)}</td>);
    }
    else if (header === "date") {
      return (<td key={header}>{FORMAT_DATE(value)}</td>);
    }
    else if (header === "Year") {
      return (<td key={header}>{value === 0 ? "N/A" : value}</td>);
    }
    else if (header === "Lookup") {
      return (<td key={header}><a className="interact_button" href={`/lookup?reg=${value}`}>Lookup</a></td>);
    }
    else {
      return(<td key={header}>{value}</td>);
    }
  };

  const exclusions = ['_id', 'id', 'dir', 'lat', 'lng', 'start_coords', 'end_coords', 'icao'];
  const filteredHeaders = headers.filter(header => !exclusions.includes(header));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; 
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPageNumbers = () => {
    let pages = [];

    // Logic to determine which buttons to show
    if (totalPages <= 5) {
      // If there are 5 or fewer pages, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // More complex logic for when there are more than 5 pages
      if (currentPage <= 3) {
        // Current page is 3 or less, show first 4 and last page
        pages = [1, 2, 3, 4, totalPages];
      } else if (currentPage > 3 && currentPage < totalPages - 2) {
        // Between page 4 and the third-to-last page
        pages = [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
      } else {
        // Last three pages
        pages = [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      }
    }

    // Render buttons based on pages array
    return pages.map(page => (
      <button
        key={page}
        className={`${currentPage === page ? `bg-[#28ace2] text-white` : `hover:bg-[#28ace2] hover:text-white`} border border-gray-300 px-2 py-1 rounded`}
        onClick={() => setCurrentPage(page)}
      >
        {page}
      </button>
    ));
  };

  const [openedCharts, setOpenedCharts] = useState({});
  const toggleOpenChart = (index) => () => setOpenedCharts({ ...openedCharts, [index]: openedCharts[index] ? !openedCharts[index] : true });

  const typeMap = {
    "Cities": "city",
    "Countries": "country",
    "Airports": "airport"
  }
  
  const setSort = (header) => {
    activeSort.header !== header 
      ? setActiveSort({ header, dir: "asc" })
      : activeSort.dir === "asc"
        ? setActiveSort({ header, dir: "desc" })
        : setActiveSort({ header: "", dir: "" })
  }

  useEffect(() => {
    console.log(activeSort);
    console.log(paginatedData)
  }, [activeSort]);

  return(
  <>
    <div className="overflow-x-scroll">
      <table className="cpp_table w-full">
        <thead className="sticky top-0">
          <tr>
          {filteredHeaders.map((header) => (
            !allAircraft 
              ? <th className="table_header" key={header}>{header.replace('_', ' ')}</th>
              : <th 
                  className="table_header cursor-pointer"
                  key={header}
                  onClick={() => setSort(header)}
                >
                  {header === "Lookup"
                    ? ""
                    : <>
                      {header.replace('_', ' ')}
                      <span className="ml-1">
                        {activeSort.header === header && <i className={`fa-solid fa-arrow-${activeSort.dir === "asc" ? "up" : "down"}`}></i>}
                      </span>
                    </>
                  }
                </th>
          ))}
          {includeChart && <th className="table_header">Graph</th>}
          </tr>
        </thead>

        <tbody>
        {paginatedData.sort((a, b) => {
          const valueA = a[activeSort.header];
          const valueB = b[activeSort.header];

          if (activeSort.dir === "asc") {
            // Handle numerical values
            if (!isNaN(valueA) && !isNaN(valueB)) {
              return valueA - valueB;
            }
            // Handle string values
            return valueA.localeCompare(valueB);
          } else if (activeSort.dir === "desc") {
            if (!isNaN(valueA) && !isNaN(valueB)) {
              return valueB - valueA;
            }
            // For descending order, you can swap the parameters in localeCompare or invert the result
            return valueB.localeCompare(valueA);
          }
          return 0;
        }).map((row, index) => (
            <>
              <tr key={index}>
                {filteredHeaders.map((header) => (
                  formatCell(header, row[header])
                ))}
                {includeChart && 
                <td key={`chart-${index}`}>
                  <div className="flex justify-center">
                    <div onClick={toggleOpenChart(index)} className="interact_button force-static">
                      {openedCharts[index] ? "Hide" : "View"}
                    </div>
                  </div>
                </td>
                }
              </tr>
              {openedCharts[index] && (
                <MiniTableChart 
                  key={index} 
                  apiQuery={
                    yearOnYearOverride 
                    ? additionalFilters 
                    : type === "Routes" 
                      ? `origin=${row.origin}&destination=${row.destination}` 
                      : `${typeMap[type]}=${row[typeMap[type]]}${additionalFilters && `&${additionalFilters}`}`
                  }
                  icao={row.icao ? row.icao : false} />
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
    <div className="w-full flex flex-col md:flex-row gap-4 md:items-center mt-auto">
      {additional && type && <p className="table-count">{Intl.NumberFormat('en-US').format(additional)}&nbsp;{type}</p>}
      {totalPages > 1 && <div className="md:ml-auto flex items-center gap-2">
        {currentPage !== 1 && 
          <button className="border-2 rounded-md py-1 px-2" onClick={() => setCurrentPage(currentPage - 1)}><i className="fa-solid fa-angles-left"></i></button>
        }
        {renderPageNumbers()}
        {currentPage !== totalPages &&
          <button className="border-2 rounded-md py-1 px-2" onClick={() => setCurrentPage(currentPage + 1)}><i className="fa-solid fa-angles-right"></i></button>
        }
        </div>}
    </div>
  </>
  )
};

export default PaginatedTable;

