"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_SUBDOMAINS,
  MAP_TILE_URL,
  institutionCategoryStyle,
} from "@/lib/site";
import type { Institution } from "@/lib/types";

const asUrl = (x: unknown) =>
  typeof x === "string" ? x : (x as { src: string }).src;

// Leaflet's default icon paths break under webpack — point them at the real
// files. We render every marker with a divIcon below, but this keeps any
// fallback default marker visible instead of broken.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: asUrl(markerIcon2x),
  iconUrl: asUrl(markerIcon),
  shadowUrl: asUrl(markerShadow),
});

const TN_CENTER: [number, number] = [11.1, 78.6];
const DEFAULT_ZOOM = 7;
const SPLIT_ZOOM = 11; // at / above this, clusters expand into single markers
const CLUSTER_RADIUS_DEG = 0.12; // ~13 km — keeps Chennai, Vandalur, Kilakarai, Madurai apart

const CATS = ["education", "healthcare", "community", "innovation"] as const;

interface Cluster {
  lat: number;
  lng: number;
  items: Institution[];
}

function buildClusters(items: Institution[]): Cluster[] {
  const clusters: Cluster[] = [];
  for (const it of items) {
    if (it.latitude == null || it.longitude == null) continue;
    const near = clusters.find(
      (c) =>
        Math.hypot(c.lat - it.latitude!, c.lng - it.longitude!) <
        CLUSTER_RADIUS_DEG
    );
    if (near) {
      near.items.push(it);
      near.lat =
        near.items.reduce((s, x) => s + (x.latitude ?? 0), 0) /
        near.items.length;
      near.lng =
        near.items.reduce((s, x) => s + (x.longitude ?? 0), 0) /
        near.items.length;
    } else {
      clusters.push({ lat: it.latitude, lng: it.longitude, items: [it] });
    }
  }
  return clusters;
}

/*
 * Marker styling is tuned for LIGHT OSM tiles.
 *
 * On the old dark basemap a white ring alone separated a marker from the
 * ground. Over light tiles that ring disappears into pale streets and parks,
 * so each marker now carries a white ring PLUS an outer navy hairline. The
 * category colour stays the fill, so the legend still reads.
 */
function dotIcon(hex: string) {
  return L.divIcon({
    className: "crescent-marker",
    html: `<span style="display:block;width:13px;height:13px;border-radius:9999px;background:${hex};border:2px solid #fff;box-shadow:0 0 0 1px rgba(15,33,64,.55),0 1px 4px rgba(15,33,64,.35)"></span>`,
    iconSize: [17, 17],
    iconAnchor: [8.5, 8.5],
    popupAnchor: [0, -10],
  });
}

function clusterIcon(count: number) {
  return L.divIcon({
    className: "crescent-cluster",
    html: `<div style="width:34px;height:34px;border-radius:9999px;background:#1a3a6b;border:2px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;font:700 13px/1 ui-sans-serif,system-ui,sans-serif;box-shadow:0 0 0 1px rgba(15,33,64,.35),0 2px 8px rgba(15,33,64,.35)">${count}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function PopupCard({ inst }: { inst: Institution }) {
  const href =
    inst.external_url ||
    `https://www.google.com/search?q=${encodeURIComponent(inst.name)}`;
  return (
    <div className="min-w-[190px]">
      <p className="text-sm font-bold text-crescent-800">{inst.name}</p>
      <p className="mt-0.5 text-xs text-slate-500">
        {inst.city}
        {inst.established_year ? ` · Est. ${inst.established_year}` : ""}
      </p>
      {inst.parent_org && (
        <p className="mt-0.5 text-[0.7rem] text-slate-500">{inst.parent_org}</p>
      )}
      <span
        className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-semibold capitalize text-white"
        style={{ background: institutionCategoryStyle[inst.category].hex }}
      >
        {inst.category}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-xs font-semibold text-crescent-600 hover:text-crescent-800"
      >
        Visit website →
      </a>
    </div>
  );
}

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMapEvents({ zoomend: () => onZoom(map.getZoom()) });
  return null;
}

/** Scroll-wheel zoom is off by default; holding Ctrl / ⌘ enables it. */
function GestureManager({ onHint }: { onHint: (v: boolean) => void }) {
  const map = useMap();
  useEffect(() => {
    const enable = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.key === "Meta") map.scrollWheelZoom.enable();
    };
    const disable = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.key === "Meta") map.scrollWheelZoom.disable();
    };
    const blur = () => map.scrollWheelZoom.disable();
    const el = map.getContainer();
    let timer: ReturnType<typeof setTimeout>;
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        onHint(true);
        clearTimeout(timer);
        timer = setTimeout(() => onHint(false), 1500);
      }
    };
    window.addEventListener("keydown", enable);
    window.addEventListener("keyup", disable);
    window.addEventListener("blur", blur);
    el.addEventListener("wheel", wheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", enable);
      window.removeEventListener("keyup", disable);
      window.removeEventListener("blur", blur);
      el.removeEventListener("wheel", wheel);
      clearTimeout(timer);
    };
  }, [map, onHint]);
  return null;
}

function Markers({
  institutions,
  zoom,
}: {
  institutions: Institution[];
  zoom: number;
}) {
  const map = useMap();
  const clusters = useMemo(() => buildClusters(institutions), [institutions]);

  const single = (it: Institution) => (
    <Marker
      key={it.id}
      position={[it.latitude as number, it.longitude as number]}
      icon={dotIcon(institutionCategoryStyle[it.category].hex)}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        <span className="font-semibold">{it.name}</span> · {it.city}
      </Tooltip>
      <Popup maxWidth={250}>
        <PopupCard inst={it} />
      </Popup>
    </Marker>
  );

  if (zoom >= SPLIT_ZOOM) {
    return <>{institutions.map(single)}</>;
  }

  return (
    <>
      {clusters.map((c, i) =>
        c.items.length === 1 ? (
          single(c.items[0])
        ) : (
          <Marker
            key={`cluster-${i}`}
            position={[c.lat, c.lng]}
            icon={clusterIcon(c.items.length)}
            eventHandlers={{
              click: () =>
                map.flyTo([c.lat, c.lng], SPLIT_ZOOM, { duration: 0.6 }),
            }}
          >
            <Tooltip direction="top" offset={[0, -16]}>
              {c.items.length} institutions · {c.items[0].city}
            </Tooltip>
          </Marker>
        )
      )}
    </>
  );
}

export default function InstitutionMap({
  institutions,
  className = "h-[350px] md:h-[450px]",
}: {
  institutions: Institution[];
  className?: string;
}) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [hint, setHint] = useState(false);

  const withCoords = useMemo(
    () =>
      institutions.filter((i) => i.latitude != null && i.longitude != null),
    [institutions]
  );

  return (
    <div
      role="figure"
      aria-label={`Map of ${withCoords.length} Crescent institutions across Tamil Nadu. The same institutions are listed as cards below this map, which is the accessible equivalent.`}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 ${className}`}
    >
      {/*
        The Leaflet canvas is decorative for assistive tech: its markers are
        divIcons with no reachable text, and panning a map by keyboard is a
        poor experience. The institution cards below carry the same data in a
        navigable form, so the map is hidden from the accessibility tree and
        the wrapper's aria-label points there instead.
      */}
      <div aria-hidden="true" className="h-full w-full">
      <MapContainer
        center={TN_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        zoomControl
        className="h-full w-full bg-sand-100"
      >
        <TileLayer
          url={MAP_TILE_URL}
          attribution={MAP_TILE_ATTRIBUTION}
          subdomains={MAP_TILE_SUBDOMAINS}
        />
        <ZoomWatcher onZoom={setZoom} />
        <GestureManager onHint={setHint} />
        <Markers institutions={withCoords} zoom={zoom} />
      </MapContainer>
      </div>

      {hint && (
        <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center bg-crescent-950/35">
          <span className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-crescent-800 shadow-lg">
            Hold Ctrl and scroll to zoom
          </span>
        </div>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 left-2 z-[600] flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-white/90 px-2.5 py-1.5 text-[0.65rem] font-medium text-slate-600 shadow"
      >
        {CATS.map((c) => (
          <span key={c} className="flex items-center gap-1 capitalize">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: institutionCategoryStyle[c].hex }}
            />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
