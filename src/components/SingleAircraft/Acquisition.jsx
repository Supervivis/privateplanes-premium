import cn from "classnames";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import global from "../styles/global.module.scss";
import styles from "./styles/styles.module.scss";
import Dropdown from "../common/Dropdown";
import { FUTURE_OPTIONS } from "../../utils/constants/app-constants";
import { useEffect, useState } from "react";
import numeral from "numeral";

const Acquisition = ({ params, currencySymbol, conversionRate }) => {
  const [displayAsChart, setDisplayAsChart] = useState(true);

  const acquisition_values = JSON.parse(params.acquisition_values);
  const labels = Object.keys(acquisition_values);
  const values = Object.values(acquisition_values);

  const [yearManufacture, setYearManufacture] = useState("Select");

  const [airframe, setAirframe] = useState(500);
  const [estimatedFutureValue, setestimatedFutureValue] = useState(FUTURE_OPTIONS[0]);
  const [futureValue, setfutureValue] = useState([]);
  const [futureValueConstant, setfutureValueConstant] = useState([]);
  const [hourAdjusted, setHourAdjusted] = useState([]);
  const [hourAdjustedSingleValue, setHourAdjustedSingleValue] = useState(0);
  const [i, seti] = useState(0);
  
  const [futureCounter, setFutureCounter] = useState(0);

  for (let counter = 0; counter < labels.length; counter++) {
    labels[counter] = labels[counter].replace("-", "");
  }

  for (var k = 0; k < values.length; k++) {
    futureValue[k] =
      values[k] *
      Math.pow(
        (100 - parseFloat(params.depreication_rate)) / 100,
        parseFloat(estimatedFutureValue)
      );
    futureValue[k].toFixed(2);
  }

  useEffect(() => {
    setfutureValueConstant(
      values[i] *
        Math.pow(
          (100 - parseFloat(params.depreication_rate)) / 100,
          parseFloat(estimatedFutureValue)
        )
    );
  }, [i, yearManufacture, estimatedFutureValue]);

  for (let kounter = 0; kounter < labels.length; kounter++) {
    let real = (2022 - labels[kounter]) * 400;
    hourAdjusted[kounter] = values[kounter];
    if (parseFloat(airframe) - real > 0) {
      for (let i = 0; i < parseFloat(airframe) - real; i++) {
        hourAdjusted[kounter] *= 0.99999;
      }
    } else {
      for (let i = 0; i < Math.abs(parseFloat(airframe) - real); i++) {
        hourAdjusted[kounter] *= 1.00001;
      }
    }
    hourAdjusted[kounter] = Math.round(hourAdjusted[kounter]);
  }

  const onYearChanged = (val) => {
    setYearManufacture(val);
    for (var c = 0; c < values.length; c++) {
      if (labels[c] === val) {
        seti(c);
        setHourAdjustedSingleValue(hourAdjusted[c]);
      }
    }
  };

  const onestimatedFutureValueChanged = (val) => {
    setestimatedFutureValue(val);
    for (var c = 0; c < FUTURE_OPTIONS.length; c++) {
      if (FUTURE_OPTIONS[c] === val) {
        setFutureCounter(c);
      }
    }
  };

  useEffect(() => {
    if (hourAdjusted[i] !== undefined) {
      setHourAdjustedSingleValue(hourAdjusted[i]);
    } else {
      setHourAdjustedSingleValue(0);
    }
  }, [airframe, yearManufacture, i]);

  const data = {
    labels,

    datasets: [
      {
        label: "Current Value",
        data: values,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Hour Adjusted",
        data: hourAdjusted,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Future Value",
        data: futureValue,
        borderColor: "rgb(153, 82, 155)",
        backgroundColor: "rgba(153, 82, 155, 0.5)",
      },
    ],
  };

  const lineGraphData = [];
  const [minLineVal, setMinLineVal] = useState(null);
  const [maxLineVal, setMaxLineVal] = useState(0);
  for (let counter = 0; counter < labels.length; counter++) {
    lineGraphData.push({
      name: labels[counter],
      "Current Value": values[counter],
      "Adjusted Value": hourAdjusted[counter],
      "Future Value": futureValue[counter],
    });

    let maxVal = Math.max(
      values[counter],
      hourAdjusted[counter],
      futureValue[counter]
    );

    if (maxVal > maxLineVal) setMaxLineVal(maxVal);

    let minVal = Math.min(
      values[counter],
      hourAdjusted[counter],
      futureValue[counter]
    );

    if (!minVal || minVal < minLineVal) setMinLineVal(minVal);
  }

  useEffect(() => {
    console.log(minLineVal, maxLineVal);
  }, [minLineVal, maxLineVal]);

  return (
    <div className="card grid lg:grid-cols-2 no-padding gap-6 md:gap-8">
      <div className="overview-left-side p-5">
        <div className="flex justify-between mb-6">
          <h3 className="text-3xl mb-4">Acquisition Costs</h3>

          <div className="interact_button md:ml-auto cursor-pointer" onClick={() => setDisplayAsChart(!displayAsChart)}>
            <i class={`fa-solid fa-${displayAsChart ? "table" : "chart"}`}></i>
            View as {displayAsChart ? "Table" : "Chart"}
          </div>
        </div>

        {displayAsChart
          ?  <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={lineGraphData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" tick={{ fontSize: '10px' }} />
                <YAxis
                  tickFormatter={(value) => (value / 1000000).toFixed(2)} // Formats the tick values to include two decimal places
                  label={{ value: "Value (Millions $)", angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle' } }}
                  domain={[minLineVal, maxLineVal]}
                />
                <Tooltip formatter={(value) => numeral(value).format("0,0")}  />
                <Legend />
                <Line type="monotone" dataKey={"Current Value"} stroke="#6C60FF" dot={false} strokeWidth={2} key={1} />
                <Line type="monotone" dataKey={"Adjusted Value"} stroke="#CE2A96" dot={false} strokeWidth={2} key={2} />
                <Line type="monotone" dataKey={"Future Value"} stroke="#106CC2" dot={false} strokeWidth={2} key={3} />
              </LineChart>
            </ResponsiveContainer>
          : <div className="w-full flex items-center justify-center">
              <table className="cpp_table mt-6 hidden md:block">
                <thead>
                  <tr>
                    <th className={cn(global.th)}>Year</th>
                    <th className={cn(global.th)}>Current Value</th>
                    <th className={cn(global.th)}>Hour Adjusted</th>
                    <th className={cn(global.th)}>Future Value</th>
                  </tr>
                </thead>
                <tbody>
                  {labels.map((label, index) => (
                    <tr key={index}>
                      <td className={cn(global.td)}>{label}</td>
                      <td className={cn(global.td)}>
                        {currencySymbol}{numeral(data.datasets[0].data[index] * conversionRate).format("0,0")}
                      </td>
                      <td className={cn(global.td)}>
                        {currencySymbol}{numeral(data.datasets[1].data[index] * conversionRate).format("0,0")}
                      </td>
                      <td className={cn(global.td)}>
                        {currencySymbol}{numeral(data.datasets[2].data[index] * conversionRate).format("0,0")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }

      </div>

      <div className="py-5 pr-5 md:py-16 flex flex-grow flex-col justify-between">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex justify-between">
            <p className="font-bold">New Purchase Price</p>
            <p>{currencySymbol}{numeral(params.new_purchase * conversionRate).format("0,0")}</p>            
          </div>

          <div className="flex justify-between">
            <p className="font-bold">Depreciation Rate</p>
            <p>-{params.depreication_rate}%</p>            
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-4 items-center">
          <div className="flex justify-between">
            <p className="font-bold">Year of Manufacture</p>
            <Dropdown
              className={styles.dropdown}
              value={yearManufacture}
              setValue={(value) => onYearChanged(value)}
              options={labels}
            />
          </div>

          <div className="flex justify-between">
            <p className="font-bold">Current Market Value</p>
            <p>{currencySymbol}{numeral(values[i]).format("0,0")}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-4 items-center">
          <div className="flex justify-between">
            <p className="font-bold">Airframe Hours</p>
            <input
              className={styles.cost_input}
              type="text"
              value={airframe}
              onChange={(e) => setAirframe(e.target.value)}
              name="nbHours"
              placeholder="Enter hours"
            />
          </div>

          <div className="flex justify-between">
            <p className="font-bold">Adjusted Value</p>
            <p>{currencySymbol}{numeral(hourAdjustedSingleValue).format("0,0")}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-4 items-center">
          <div className="flex justify-between">
            <p className="font-bold">Estimated Future Value</p>
            <Dropdown
              className={styles.dropdown}
              value={estimatedFutureValue}
              setValue={(value) => onestimatedFutureValueChanged(value)}
              options={FUTURE_OPTIONS}
            />
          </div>

          <div className="flex justify-between">
            <p className="font-bold">Future Value</p>
            <p>{currencySymbol}{numeral(futureValueConstant * conversionRate).format("0,0")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Acquisition;
