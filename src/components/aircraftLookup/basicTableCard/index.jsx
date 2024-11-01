import React from 'react';

const BasicTableCard = ({ title, data, additional, type, includeCharts }) => {
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const formatCell = (header, value) => {
    if (header === "rating") {
      let changeColour;

      if (value < 4) {
        changeColour = 'positiveChange';
      } else if (value < 7) {
        changeColour = 'alert';
      } else {
        changeColour = 'negativeChange';
      }
      const changeClass = `${changeColour} change change_text`;
      const arrowDirection = value > 0 ? "up" : "down";
      return (
        <div className="flex justify-center">
          <div className={changeClass}>
            {value}
          </div>
        </div>
        
      );
    } else if (header === "movements") {
      return Intl.NumberFormat('en-US').format(value);
    }
    else if (header === "graph") {
      return (
        <div className="interact_button">
          View
        </div>
      );
    } else {
      return value;
    }
  };

  return(
  <>
    <div className="flex items-center">
      <h3>{title}</h3>
      <div className="interact_button ml-auto">
        <i className="fa-solid fa-filter"></i>
        <p>Filter</p>
      </div>
    </div>

    <table className="cpp_table w-full mt-4 overflow-scroll">
      <thead>
        <tr>
          {headers.map((header) => (
            <th className="table_header" key={header}>{header.replace('_', ' ')}</th>
          ))}
          {includeCharts && <th className="table_header">Graph</th>}
        </tr>
      </thead>

      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {headers.map((header) => (
              <td key={header}>{formatCell(header, row[header])}</td>
            ))}
            {includeCharts && <td><div className="interact_button">View</div></td>}
          </tr>
        ))}
      </tbody>
    </table>

    {additional && type && <><a href="#" className="view_more">{Intl.NumberFormat('en-US').format(additional)}&nbsp;{type}</a></>}
  </>)
};

export default BasicTableCard;

