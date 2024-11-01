import React from "react";
import numeral from "numeral";

const StatComparisonCard = ({ title, data, rows }) => {

  const renderTableRow = (displayName, variableName, isNumeral) => {
    return (
      <tr>
        <td>{displayName}</td>
        {data.map((aircraft) => {
          const value = aircraft[variableName];
          const formatValue = (value) => {
            if (value === true) return "Yes";
            if (value === false) return "No";
            return value;
          }
          return (
            <td>
              {isNumeral ? numeral(value).format("0,0") : formatValue(value)}
            </td>
          );
        })}
      </tr>
    );
  };
  

  return (
    <div className="card">
      <h3 className="text-3xl">{title}</h3>

      <table className="cpp_table table-auto w-full mt-8">
        <thead className="first-col-left">
          <tr>
            <th></th>
            {data.map((aircraft) => {
            return (
              <th>{aircraft.aircraft_name}</th>
            )})}
          </tr>
        </thead>
        <tbody className="first-col-left">
          {rows.map((row) => {
            return renderTableRow(row.displayName, row.variableName, row.isNumeral);
          })}
        </tbody>
      </table>
    </div>
  );
};
export default StatComparisonCard;
