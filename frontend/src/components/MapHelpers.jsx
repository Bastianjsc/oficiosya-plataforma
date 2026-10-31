import { useEffect } from 'react';
import { useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const MapUpdater = ({ center, animate = false }) => {
  const map = useMap();
  useEffect(() => {
    if (animate) {
      map.flyTo(center, 16, { animate: true, duration: 1.5 });
    } else {
      map.setView(center, map.getZoom());
    }
  }, [center, map, animate]);
  return null;
};

export const ClickSearcher = ({ setCenter }) => {
  useMapEvents({
    click(e) { setCenter({ lat: e.latlng.lat, lng: e.latlng.lng }); }
  });
  return null;
};

export const MapPicker = ({ setCoords }) => {
  useMapEvents({
    click(e) { setCoords(e.latlng.lat, e.latlng.lng); }
  });
  return null;
};

// --- CONFIGURACIÓN DE MARCADOR ROJO ---
// eslint-disable-next-line react-refresh/only-export-components
export const marcadorRojo = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});