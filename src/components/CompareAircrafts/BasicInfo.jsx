import React from "react";
import numeral from "numeral";

const BasicInfo = ({ data }) => {

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
      <h3 className="text-3xl">Basic Info</h3>

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
          {renderTableRow("Production Start", "production_start", false)}
          {renderTableRow("Production End", "production_end", false)}
          {renderTableRow("In Production?", "in_production", false)}
          {renderTableRow("Number Made", "number_made", true)}
          {renderTableRow("Number in Service", "number_in_service", true)}
          {renderTableRow("Serial Numbers", "serial_numbers", true)}
        </tbody>
      </table>
    </div>
  );
};
export default BasicInfo;
