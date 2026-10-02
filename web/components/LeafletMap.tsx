"use client";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { fmtINR } from "@/lib/predict";

export default function LeafletMap({
  houses, onSelect, colorFn,
}: {
  houses: any[];
  onSelect: (h: any) => void;
  colorFn: (price: number) => string;
}) {
  return (
    <MapContainer center={[17.44, 78.45]} zoom={11} style={{ height: "100%", width: "100%", background: "#0b1220" }} scrollWheelZoom>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {houses.map((h) => {
        const c = colorFn(h.price);
        return (
          <CircleMarker
            key={h.id}
            center={[h.lat, h.long]}
            radius={3.5}
            pathOptions={{ color: c, fillColor: c, fillOpacity: 0.75, weight: 0.5 }}
            eventHandlers={{ click: () => onSelect(h) }}
          >
            <Tooltip>
              <b>{fmtINR(h.price)}</b> · {h.area.toLocaleString("en-IN")} sq ft · {h.bedrooms} BHK · {h.location}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
