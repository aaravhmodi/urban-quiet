"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from "react-leaflet";
import { NoiseSample, NoiseZone } from "@/types";

interface NoiseMapProps {
  samples: NoiseSample[];
  zones: NoiseZone[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  traffic: "🚗",
  construction: "🏗️",
  siren: "🚨",
  crowd: "👥",
  music: "🎵",
  nature: "🌿",
  indoor: "🏠",
  quiet: "🤫",
  unknown: "❓",
};

function loudnessColor(score: number): string {
  if (score < 35) return "#22c55e";
  if (score <= 65) return "#eab308";
  return "#ef4444";
}

function zoneColor(zoneType: NoiseZone["zoneType"]): string {
  if (zoneType === "quiet") return "#22c55e";
  if (zoneType === "moderate") return "#eab308";
  return "#ef4444";
}

export default function NoiseMap({ samples, zones }: NoiseMapProps) {
  return (
    <MapContainer
      center={[43.65, -79.38]}
      zoom={13}
      className="w-full h-full"
      style={{ background: "#1e293b" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {zones.map((zone) => (
        <Circle
          key={zone.cellId}
          center={[zone.centerLatitude, zone.centerLongitude]}
          radius={400}
          pathOptions={{
            color: zoneColor(zone.zoneType),
            fillColor: zoneColor(zone.zoneType),
            fillOpacity: 0.15,
            weight: 1,
            opacity: 0.4,
          }}
        />
      ))}

      {samples.map((sample) => {
        const color = loudnessColor(sample.loudnessScore);
        const radius = 4 + (sample.loudnessScore / 100) * 12;
        const emoji = CATEGORY_EMOJIS[sample.soundCategory] ?? "❓";

        return (
          <CircleMarker
            key={sample.id}
            center={[sample.latitude, sample.longitude]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.7,
              weight: 1.5,
            }}
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <div className="font-semibold mb-1">
                  {emoji} {sample.soundCategory.charAt(0).toUpperCase() + sample.soundCategory.slice(1)}
                </div>
                <div>Loudness: <strong>{Math.round(sample.loudnessScore)}/100</strong></div>
                <div className="text-gray-500 text-xs mt-1">
                  {new Date(sample.timestamp).toLocaleString()}
                </div>
                {sample.note && (
                  <div className="mt-1 italic text-gray-600">{sample.note}</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
