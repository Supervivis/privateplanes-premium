import React from 'react';

import PaginatedTable from '../paginatedTable';

const MapWithChart = ({ title, data, additional, type }) => {
  return(
  <div className="card no-padding grid lg:grid-cols-2">
    <div className="chart_bg h-64 w-100 lg:h-full" />

    <PaginatedTable title={title} data={data} additional={additional} type={type} />
  </div>)
};

export default MapWithChart;

