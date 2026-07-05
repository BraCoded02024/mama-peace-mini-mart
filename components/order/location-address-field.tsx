"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, Loader2, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  buildGoogleMapsUrl,
  isBareCoordinates,
  isGhanaPostGps,
  type Coordinates,
  type GeocodeSearchResult,
} from "@/lib/location";

export type LocationPickResult = {
  areaLabel: string;
  coordinates: Coordinates;
  googleMapsUrl: string;
  landmark: string;
};

type LocationAddressFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onLocationPick?: (result: LocationPickResult) => void;
  placeholder?: string;
  required?: boolean;
};

const ACCRA_CENTER: Coordinates = { lat: 5.6037, lng: -0.187 };

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
    );

    if (!response.ok) return "Selected delivery area";

    const data = (await response.json()) as { label?: string };
    return data.label?.trim() || "Selected delivery area";
  } catch {
    return "Selected delivery area";
  }
}

async function searchArea(query: string): Promise<GeocodeSearchResult[]> {
  const response = await fetch(`/api/geocode/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) return [];

  const data = (await response.json()) as { results?: GeocodeSearchResult[] };
  return data.results ?? [];
}

export function LocationAddressField({
  id,
  value,
  onChange,
  onLocationPick,
  placeholder = "East Legon, Madina, or GA-123-4567",
  required,
}: LocationAddressFieldProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const geocodeRequestRef = useRef(0);
  const autoSearchQueryRef = useRef<string | null>(null);

  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [resolvingArea, setResolvingArea] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const [geoError, setGeoError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [pickedCoords, setPickedCoords] = useState<Coordinates | null>(null);
  const [areaSearch, setAreaSearch] = useState("");
  const [areaName, setAreaName] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodeSearchResult[]>([]);
  const [landmark, setLandmark] = useState("");

  async function updateResolvedArea(coords: Coordinates) {
    const requestId = ++geocodeRequestRef.current;
    setResolvingArea(true);

    const label = await reverseGeocode(coords.lat, coords.lng);

    if (requestId !== geocodeRequestRef.current) return;

    setAreaName(label);
    setResolvingArea(false);
  }

  function setMarkerPosition(
    coords: Coordinates,
    map?: import("leaflet").Map | null,
    refreshLabel = true
  ) {
    markerRef.current?.setLatLng([coords.lat, coords.lng]);
    map?.panTo([coords.lat, coords.lng]);
    setPickedCoords(coords);
    setSearchResults([]);
    if (refreshLabel) void updateResolvedArea(coords);
  }

  function applySearchResult(result: GeocodeSearchResult) {
    setAreaName(result.label);
    setAreaSearch(result.label);
    setSearchResults([]);
    setSearchError("");
    setMarkerPosition({ lat: result.lat, lng: result.lng }, mapRef.current, false);
    mapRef.current?.setZoom(16);
  }

  async function handleAreaSearch(event?: React.FormEvent) {
    event?.preventDefault();

    const query = areaSearch.trim();
    if (query.length < 2) {
      setSearchError("Type at least 2 characters to search your area.");
      return;
    }

    setSearching(true);
    setSearchError("");
    setGeoError("");

    try {
      const results = await searchArea(query);

      if (results.length === 0) {
        setSearchError("Area not found. Try a nearby landmark or drag the pin on the map.");
        setSearchResults([]);
        return;
      }

      if (results.length === 1) {
        applySearchResult(results[0]);
        return;
      }

      setSearchResults(results);
    } catch {
      setSearchError("Could not search that area. Try again or drag the pin on the map.");
    } finally {
      setSearching(false);
    }
  }

  function handleOpenPicker() {
    const existing = value.trim();
    if (existing && !isBareCoordinates(existing)) {
      setAreaSearch(existing);
      setAreaName(existing);
      autoSearchQueryRef.current = existing;
    } else {
      autoSearchQueryRef.current = null;
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open || !mapContainerRef.current || mapRef.current) return;

    let cancelled = false;

    async function updateAreaLabel(coords: Coordinates) {
      const requestId = ++geocodeRequestRef.current;
      setResolvingArea(true);

      const label = await reverseGeocode(coords.lat, coords.lng);

      if (requestId !== geocodeRequestRef.current || cancelled) return;

      setAreaName(label);
      setResolvingArea(false);
    }

    function placeMarker(
      coords: Coordinates,
      map?: import("leaflet").Map | null,
      refreshLabel = true
    ) {
      markerRef.current?.setLatLng([coords.lat, coords.lng]);
      map?.panTo([coords.lat, coords.lng]);
      setPickedCoords(coords);
      setSearchResults([]);
      if (refreshLabel) void updateAreaLabel(coords);
    }

    async function initMap() {
      setMapLoading(true);
      setMapError("");

      try {
        const L = await import("leaflet");

        if (cancelled || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
          center: [ACCRA_CENTER.lat, ACCRA_CENTER.lng],
          zoom: 15,
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
          placeMarker({ lat: position.lat, lng: position.lng });
        });

        map.on("click", (event) => {
          placeMarker({ lat: event.latlng.lat, lng: event.latlng.lng }, map);
        });

        mapRef.current = map;
        markerRef.current = marker;
        placeMarker(ACCRA_CENTER, map);

        const pendingQuery = autoSearchQueryRef.current;
        autoSearchQueryRef.current = null;

        if (pendingQuery && !cancelled) {
          setSearching(true);
          try {
            const results = await searchArea(pendingQuery);
            if (!cancelled && results.length > 0) {
              const bestMatch = results[0];
              setAreaName(bestMatch.label);
              setAreaSearch(bestMatch.label);
              placeMarker({ lat: bestMatch.lat, lng: bestMatch.lng }, map, false);
              map.setZoom(16);
              if (results.length > 1) setSearchResults(results);
            } else if (!cancelled) {
              setSearchError("Area not found on the map. Drag the pin to your exact spot.");
            }
          } finally {
            if (!cancelled) setSearching(false);
          }
        }
      } catch {
        setMapError("Could not load the map. You can still type your area manually.");
      } finally {
        if (!cancelled) setMapLoading(false);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      geocodeRequestRef.current += 1;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [open]);

  async function handleConfirmMapPick() {
    if (!pickedCoords) return;

    setResolvingArea(true);
    const areaLabel =
      areaName.trim() || (await reverseGeocode(pickedCoords.lat, pickedCoords.lng));
    setResolvingArea(false);

    onChange(areaLabel);
    onLocationPick?.({
      areaLabel,
      coordinates: pickedCoords,
      googleMapsUrl: buildGoogleMapsUrl(pickedCoords),
      landmark: landmark.trim(),
    });

    handleCloseMap();
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError("Location is not supported on this device. Please type your area.");
      return;
    }

    setLocating(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMarkerPosition(coords, mapRef.current);
        mapRef.current?.setZoom(17);
        setLocating(false);
      },
      () => {
        setGeoError("Could not get your location. Please type your area or pick on the map.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function handleCloseMap() {
    setOpen(false);
    setMapError("");
    setGeoError("");
    setSearchError("");
    setPickedCoords(null);
    setAreaSearch("");
    setAreaName("");
    setSearchResults([]);
    setLandmark("");
    geocodeRequestRef.current += 1;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  }

  const showCoordinateWarning =
    isBareCoordinates(value) && !isGhanaPostGps(value);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="pr-3"
        />
        <button
          type="button"
          onClick={handleOpenPicker}
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
        Type your <strong className="font-medium text-mama-ink">area or landmark</strong>{" "}
        (e.g. East Legon, Spintex, Madina), your{" "}
        <strong className="font-medium text-mama-ink">Ghana Post GPS code</strong>{" "}
        (GA-123-4567), or tap <strong className="font-medium text-mama-ink">Pick</strong>{" "}
        to search your area on the map and drop a pin.
      </p>

      {showCoordinateWarning && (
        <p className="text-xs text-amber-700" role="status">
          Coordinates alone are hard for riders to use. Add your area name or pick
          on the map so we save a readable address and Google Maps link.
        </p>
      )}

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
                  Search your area by name, then fine-tune the pin on the map.
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

            <div className="space-y-3 overflow-y-auto px-5 py-4">
              <form onSubmit={handleAreaSearch} className="space-y-2">
                <Label htmlFor="location-area-search">Search your area</Label>
                <div className="flex gap-2">
                  <Input
                    id="location-area-search"
                    value={areaSearch}
                    onChange={(e) => setAreaSearch(e.target.value)}
                    placeholder="East Legon, Madina, Spintex..."
                  />
                  <Button type="submit" variant="outline" disabled={searching}>
                    {searching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Find
                  </Button>
                </div>
                <p className="text-xs text-mama-muted">
                  Type your area and tap Find — the map pin will move there. You can
                  still drag the pin for your exact spot.
                </p>
              </form>

              {searchError && (
                <p className="text-xs text-red-600" role="alert">
                  {searchError}
                </p>
              )}

              {searchResults.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-mama-muted">
                    Matching areas
                  </p>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.lat}-${result.lng}-${result.label}`}
                        type="button"
                        onClick={() => applySearchResult(result)}
                        className="w-full rounded-xl border border-mama-border bg-white px-3 py-2 text-left text-sm transition hover:border-mama-green/40 hover:bg-mama-gray/60"
                      >
                        <span className="font-medium text-mama-ink">{result.label}</span>
                        <span className="mt-0.5 block text-xs text-mama-muted">
                          {result.displayName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                <div className="space-y-2">
                  <Label htmlFor="location-area-name">Area name for riders</Label>
                  <Input
                    id="location-area-name"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    placeholder="East Legon, Madina..."
                  />
                  <p className="text-[11px] text-mama-muted">
                    {resolvingArea
                      ? "Updating area from map pin..."
                      : `Pin: ${pickedCoords.lat.toFixed(5)}, ${pickedCoords.lng.toFixed(5)}`}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="location-landmark">
                  House number / landmark{" "}
                  <span className="font-normal text-mama-muted">(Optional)</span>
                </Label>
                <Textarea
                  id="location-landmark"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="House 12, blue gate, near Shell filling station..."
                  className="min-h-[72px]"
                />
              </div>

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
                  disabled={!pickedCoords || !!mapError || resolvingArea || !areaName.trim()}
                >
                  {resolvingArea ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving area...
                    </>
                  ) : (
                    "Use this location"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
