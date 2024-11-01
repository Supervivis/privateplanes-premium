import React, {useState, useEffect} from 'react';
import apiService from '../../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DonutChartCard = ({ title, apiRoute, timePeriod, additionalApiFilters, scalingHeight, setNewsMaxHeight }) => {
  const COLORS = ['#FF0000', '#FFB800', '#63C700', '#0400B8', '#0097C7', '#4F0000', '#B8B8B8'];
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [chartDimensions, setChartDimensions] = useState({ inner: 0, outer: 0, height: 0 });
  const [fetching, setFetching] = useState(false);
  const [formattedData, setFormattedData] = useState([]);
  const RADIAN = Math.PI / 180;
  const formattedNames = {
    "NA": "North America",
    "SA": "South America",
    "EU": "Europe",
    "AF": "Africa",
    "AS": "Asia",
    "OC": "Oceania",
    "L": "Large",
    "M": "Medium",    
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth > 1730) {
      console.log("Dimension A");
      setChartDimensions({ inner: windowWidth * 0.03, outer: windowWidth * 0.075, height: 400 });
    }
    else if (windowWidth > 1400) {
      console.log("Dimension B");
      setChartDimensions({ inner: windowWidth * 0.025, outer: windowWidth * 0.065, height: 250 });
    }
    else if (windowWidth > 1023) {
      console.log("Dimension C");
      setChartDimensions({ inner: windowWidth * 0.02, outer: windowWidth * 0.055, height: 150 });
    }
    else if (windowWidth > 767) {
      console.log("Dimension D");
      setChartDimensions({ inner: windowWidth * 0.045, outer: windowWidth * 0.12, height: 300 });
    }
    else {
      console.log("Dimension E");
      setChartDimensions({ inner: windowWidth * 0.1, outer: windowWidth * 0.25, height: 400 });
    }
  }, [windowWidth]);

  useEffect(() => {
    if (setNewsMaxHeight) setNewsMaxHeight(chartDimensions.height + 300);
  }, [chartDimensions]);

  useEffect(() => {
    async function fetchData() {
      setFetching(true);
      const data = await apiService[apiRoute](timePeriod ? timePeriod : 30, additionalApiFilters);
      setFormattedData(Object.entries(data).map(([name, value]) => ({ name: formattedNames[name] ? formattedNames[name] : name, value })));
      setFetching(false);
    }
    fetchData();
  }, [timePeriod, apiRoute]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index
  }) => {
    if (percent < 0.09) return null;
  
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x  = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy  + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        fontWeight={800}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return(
  <div className="card flex flex-col gap-6" style={{maxHeight: setNewsMaxHeight ? chartDimensions.height + 300 : "auto"}}>
    <h3 className="mb-4">{title}</h3>

    {fetching && 
      <div className="my-auto flex flex-col justify-center items-center">
        <i className="fa fa-spinner fa-spin text-6xl"></i>
        <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
      </div>
    }

    {!fetching && (
      formattedData.length === 0
      ? <div className="my-auto flex flex-col justify-center items-center">
          <i className="fa fa-solid fa-plane-circle-exclamation text-4xl"></i>
          <h3 className="text-xl mt-6">No Data Available.</h3>
        </div>
      : <>
          <ResponsiveContainer width="100%" height={chartDimensions.height}>
            <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={chartDimensions.outer}
                innerRadius={chartDimensions.inner}
                fill="#8884d8"
                dataKey="value"
                stroke="none"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Tooltip
                  wrapperStyle={{ visibility: 'visible' }}
                  itemStyle={{ color: 'black' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.2)' }}
                />
                <Legend align="right" verticalAlign="middle" layout="vertical" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-4 mt-auto overflow-x-auto" style={{ maxHeight: '100px' }}>
            {formattedData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 shrink-0">
                <div className="w-6 h-4" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <p>{entry.name}</p>
              </div>
            ))}
          </div>
        </>
    )}
  </div>)
};

export default DonutChartCard;

