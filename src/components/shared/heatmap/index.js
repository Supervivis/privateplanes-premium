import React, {useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'heatmap.js/build/heatmap.js';
import HeatmapOverlay from '../../shared/heatmap/leaflet-heatmap';

const Heatmap = ({ data, containerId }) => {
  const mapRef = React.useRef(null);
  const heatmapLayer = React.useRef(null);

  React.useEffect(() => {
    if (!mapRef.current) {
      const map = L.map(`heatmap-${containerId}`, {
        zoomControl: true, // Disable zoom control
        scrollWheelZoom: false, // Disable zooming with the mouse wheel
        doubleClickZoom: true, // Disable zooming with double click
        touchZoom: true, // Disable zooming with touch
        dragging: true // Enable panning/dragging
      }).setView([0, 0], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

      const cfg = {
        radius: 1,
        maxOpacity: .8,
        scaleRadius: true,
        useLocalExtrema: true,
        latField: 'lat',
        lngField: 'lng',
        valueField: 'count'
      };

      heatmapLayer.current = new HeatmapOverlay(cfg);
      heatmapLayer.current.addTo(map);
      mapRef.current = map;
    }

    const heatmapData = {
      max: 8,
      data: data.map(item => ({
        lat: item.lat,
        lng: item.lng,
        count: item.count
      }))
    };
    heatmapLayer.current.setData(heatmapData);

  }, [data]);

  return (<div id={`heatmap-${containerId}`} style={{ height: '100%', width: '100%' }}></div>);
};

export default Heatmap;