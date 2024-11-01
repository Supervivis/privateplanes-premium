import React, {useState, useEffect} from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import numeral from "numeral";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const transformData = (data) => {
  let transformedData = months.map((monthName, index) => {
    let monthData = { name: monthName };
    for (const year in data) {
      monthData[year] = data[year][index + 1] || 0;
    }
    return monthData;
  });
  return transformedData;
};

const FleetHoursCard = ({preData, toggleShowAllAircraft}) => {
  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [buttonText, setButtonText] = useState("View All Aircraft");
  const toggleButtonText = () => {
    buttonText === "View All Aircraft" ? setButtonText("Hide All Aircraft") : setButtonText("View All Aircraft");
    toggleShowAllAircraft();
  }

  useEffect(() => {
    async function fetchData() {
      setFetching(true);
      if (Object.keys(preData).length === 0) {
        setFetching(false);
        return;
      }
      setRawData(preData);
      setData(transformData(preData));
      setFetching(false);
    }
    fetchData();
  }, [preData]);

  return (
  <div className={`${Object.keys(preData).length == 0 && "h-full"} card`}>
    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8">
      <h3>Fleet Flight Hours</h3>

      <button onClick={() => toggleButtonText()} className="interact_button">{buttonText}</button>
    </div>

    {fetching && 
      <div className="py-24 flex flex-col justify-center items-center">
        <i className="fa fa-spinner fa-spin text-6xl"></i>
        <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
      </div>
    }

    {!fetching && (
      Object.keys(rawData).length === 0
      ? <div className="py-24 flex flex-col justify-center items-center">
          <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
          <h3 className="text-xl mt-6">No Data Available.</h3>
        </div>
      : <>
          <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" tick={{ fontSize: '10px' }} />
                <YAxis label={{ value: "Flight Hours", angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle' } }} tickFormatter={(value) => `${value > 9999 ? `${value / 1000}k` : value}`} />
                <Tooltip formatter={(value) => numeral(value).format("0,0")}  />
                <Legend />
                <Line type="monotone" dataKey="2019" stroke="#8884d8" activeDot={{ r: 8 }} dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="2020" stroke="#CE2A96" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="2021" stroke="#106CC2" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="2022" stroke="#FF8660" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="2023" stroke="#04BF00" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="2024" stroke="#930101" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
        </>
    )}

  </div>
  )
};
  
export default FleetHoursCard;