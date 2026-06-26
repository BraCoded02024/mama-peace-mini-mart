"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, Loader2, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LocationAddressFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coords: { lat: number; lng: number } | null) => void;
  placeholder?: string;
  required?: boolean;
};

const ACCRA_CENTER = { lat: 5.6037, lng: -0.187 };

function formatCoordinates(lat: number, lng: number) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function LocationAddressField({
  id,
  value,
  onChange,
  onCoordinatesChange,
  placeholder = "GA-123-4567 or tap Pick location",
  required,
}: LocationAddressFieldProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);

  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const [geoError, setGeoError] = useState("");
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    if (!open || !mapContainerRef.current || mapRef.current) return;

    let cancelled = false;

    async function initMap() {
      setMapLoading(true);
      setMapError("");

      try {
        const L = await import("leaflet");
        await import("leaflet/dist/leaflet.css");

        if (cancelled || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
          center: [ACCRA_CENTER.lat, ACCRA_CENTER.lng],
          zoom: 13,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        const marker = L.marker([ACCRA_CENTER.lat, ACCRA_CENTER.lng], {
          draggable: true,
          icon: L.divIcon({
            className: "",
            html: '<div style="background:#063328;width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          }),
        }).addTo(map);

        marker.on("dragend", () => {
          const position = marker.getLatLng();
          setPickedCoords({ lat: position.lat, lng: position.lng });
        });

        map.on("click", (event) => {
          marker.setLatLng(event.latlng);
          setPickedCoords({ lat: event.latlng.lat, lng: event.latlng.lng });
        });

        mapRef.current = map;
        markerRef.current = marker;
        setPickedCoords({ lat: ACCRA_CENTER.lat, lng: ACCRA_CENTER.lng });
      } catch {
        setMapError("Could not load the map. You can still type your address manually.");
      } finally {
        if (!cancelled) setMapLoading(false);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [open]);

  function applyCoordinates(lat: number, lng: number) {
    const formatted = formatCoordinates(lat, lng);
    onChange(formatted);
    onCoordinatesChange?.({ lat, lng });
    setGeoError("");
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError("Location is not supported on this device. Please type your address.");
      return;
    }

    setLocating(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        applyCoordinates(latitude, longitude);
        setLocating(false);
        setOpen(false);
      },
      () => {
        setGeoError("Could not get your location. Please type your address or pick on the map.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function handleConfirmMapPick() {
    if (!pickedCoords) return;
    applyCoordinates(pickedCoords.lat, pickedCoords.lng);
    setOpen(false);
  }

  function handleCloseMap() {
    setOpen(false);
    setMapError("");
    setPickedCoords(null);
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onCoordinatesChange?.(null);
          }}
          placeholder={placeholder}
          required={required}
          className="pr-3"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex shrink-0 flex-col items-center justify-center rounded-xl border-2 border-mama-green bg-mama-green/10 px-3 py-2 text-mama-green transition hover:bg-mama-green hover:text-white"
          aria-label="Pick delivery location on map"
        >
          <MapPin className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
            Pick
          </span>
        </button>
      </div>

      <p className="text-xs text-mama-muted">
        Type your Ghana Post GPS code (e.g. GA-123-4567), or tap{" "}
        <strong className="font-medium text-mama-ink">Pick</strong> to choose your
        location on the map or use your current position.
      </p>

      {geoError && (
        <p className="text-xs text-red-600" role="alert">
          {geoError}
        </p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-picker-title"
        >
          <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-mama-border bg-white shadow-lg">
            <div className="flex items-start justify-between gap-3 border-b border-mama-border px-5 py-4">
              <div>
                <p
                  id="location-picker-title"
                  className="font-serif text-lg text-mama-ink"
                >
                  Choose delivery location
                </p>
                <p className="mt-1 text-sm text-mama-muted">
                  Tap the map to drop a pin, drag it to adjust, or use your
                  current location.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseMap}
                className="rounded-lg p-1 text-mama-muted hover:bg-mama-gray"
                aria-label="Close location picker"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 px-5 py-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleUseCurrentLocation}
                disabled={locating}
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crosshair className="h-4 w-4" />
                )}
                {locating ? "Getting your location..." : "Use my current location"}
              </Button>

              <div
                className={cn(
                  "relative h-56 overflow-hidden rounded-xl border border-mama-border bg-mama-gray",
                  mapLoading && "animate-pulse"
                )}
              >
                <div ref={mapContainerRef} className="h-full w-full" />
                {mapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-mama-muted">
                    Loading map...
                  </div>
                )}
              </div>

              {mapError && (
                <p className="text-xs text-red-600" role="alert">
                  {mapError}
                </p>
              )}

              {pickedCoords && !mapError && (
                <p className="text-xs text-mama-muted">
                  Selected: {formatCoordinates(pickedCoords.lat, pickedCoords.lng)}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={handleCloseMap}
                >
                  Type manually
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleConfirmMapPick}
                  disabled={!pickedCoords || !!mapError}
                >
                  Use this location
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
