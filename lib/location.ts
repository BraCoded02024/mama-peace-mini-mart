export type Coordinates = { lat: number; lng: number };

const GOOGLE_MAPS_PIN_PREFIX = "Google Maps pin:";

export function parseCoordinates(text: string): Coordinates | null {
  const match = text.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;

  const lat = Number.parseFloat(match[1]);
  const lng = Number.parseFloat(match[2]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
}

export function isBareCoordinates(text: string) {
  return parseCoordinates(text) !== null;
}

export function isGhanaPostGps(text: string) {
  return /^[A-Z]{2}-\d{3,4}-\d{4,5}$/i.test(text.trim());
}

export function buildGoogleMapsUrl(coords: Coordinates): string {
  return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
}

export function buildGoogleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
}

export function formatMapPinNote(coords: Coordinates) {
  return `${GOOGLE_MAPS_PIN_PREFIX} ${buildGoogleMapsUrl(coords)}`;
}

export function extractGoogleMapsUrl(text?: string | null): string | null {
  if (!text) return null;

  const urlMatch = text.match(/https:\/\/www\.google\.com\/maps[^\s)]+/i);
  if (urlMatch) return urlMatch[0];

  const coords = parseCoordinates(text);
  if (coords) return buildGoogleMapsUrl(coords);

  return null;
}

export function stripMapPinNote(text: string) {
  return text
    .replace(new RegExp(`${GOOGLE_MAPS_PIN_PREFIX}\\s*https:\\/\\/\\S+`, "gi"), "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function mergeLocationDescription(
  existing: string,
  coords: Coordinates,
  landmark?: string
) {
  const withoutMapPin = stripMapPinNote(existing);
  const mapLine = formatMapPinNote(coords);
  const landmarkText = landmark?.trim();

  return [landmarkText, withoutMapPin, mapLine].filter(Boolean).join("\n\n");
}

type NominatimAddress = {
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
  town?: string;
  city?: string;
  county?: string;
  state?: string;
};

type NominatimReverseResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

export function formatReverseGeocodeLabel(data: NominatimReverseResponse): string {
  const address = data.address;

  if (address) {
    const parts = [
      address.suburb,
      address.neighbourhood,
      address.quarter,
      address.city_district,
      address.town,
      address.city,
      address.county,
      address.state,
    ].filter(Boolean);

    const unique = [...new Set(parts.map((part) => part!.trim()))];
    if (unique.length > 0) {
      return unique.slice(0, 3).join(", ");
    }
  }

  if (data.display_name) {
    return data.display_name.split(",").slice(0, 3).join(",").trim();
  }

  return "Selected delivery area";
}

export type GeocodeSearchResult = {
  lat: number;
  lng: number;
  label: string;
  displayName: string;
};

type NominatimSearchResponse = Array<{
  lat: string;
  lon: string;
  display_name?: string;
  address?: NominatimAddress;
}>;

export function formatGeocodeSearchResult(
  item: NominatimSearchResponse[number]
): GeocodeSearchResult {
  const lat = Number.parseFloat(item.lat);
  const lng = Number.parseFloat(item.lon);
  const label = formatReverseGeocodeLabel({
    display_name: item.display_name,
    address: item.address,
  });

  return {
    lat,
    lng,
    label,
    displayName: item.display_name ?? label,
  };
}

export function normalizeAreaSearchQuery(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return trimmed;
  if (/ghana/i.test(trimmed)) return trimmed;
  return `${trimmed}, Ghana`;
}

export function resolveOrderMapsUrl(
  gpsAddress: string,
  locationDescription?: string | null
): string {
  const fromDescription = extractGoogleMapsUrl(locationDescription);
  if (fromDescription) return fromDescription;

  const coords = parseCoordinates(gpsAddress);
  if (coords) return buildGoogleMapsUrl(coords);

  return buildGoogleMapsSearchUrl(gpsAddress);
}

export type DeviceLocationErrorCode =
  | "unsupported"
  | "insecure"
  | "denied"
  | "unavailable"
  | "timeout";

export function deviceLocationErrorMessage(code: DeviceLocationErrorCode): string {
  switch (code) {
    case "unsupported":
      return "Your browser does not support location. Please type your area or search on the map.";
    case "insecure":
      return "Location only works on a secure connection (https). Please type your area instead.";
    case "denied":
      return "Location access was blocked. On your phone, allow location for this website in browser settings, then tap Try again.";
    case "unavailable":
      return "Could not detect your location. Turn on phone GPS/location services, then try again.";
    case "timeout":
      return "Location took too long. Move near a window, turn on GPS, or search your area on the map.";
  }
}

function mapGeolocationError(error: GeolocationPositionError): DeviceLocationErrorCode {
  if (error.code === error.PERMISSION_DENIED) return "denied";
  if (error.code === error.POSITION_UNAVAILABLE) return "unavailable";
  return "timeout";
}

function readPosition(position: GeolocationPosition): Coordinates {
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
}

function getCurrentPosition(options: PositionOptions): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(readPosition(position)),
      (error) => reject(mapGeolocationError(error)),
      options
    );
  });
}

function watchPositionOnce(options: PositionOptions, timeoutMs: number): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let watchId = 0;

    const finish = (coords: Coordinates) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      navigator.geolocation.clearWatch(watchId);
      resolve(coords);
    };

    const fail = (code: DeviceLocationErrorCode) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      navigator.geolocation.clearWatch(watchId);
      reject(code);
    };

    const timer = setTimeout(() => fail("timeout"), timeoutMs);

    watchId = navigator.geolocation.watchPosition(
      (position) => finish(readPosition(position)),
      (error) => fail(mapGeolocationError(error)),
      options
    );
  });
}

function toDeviceLocationErrorCode(error: unknown): DeviceLocationErrorCode {
  const value =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "timeout";

  if (
    value === "unsupported" ||
    value === "insecure" ||
    value === "denied" ||
    value === "unavailable" ||
    value === "timeout"
  ) {
    return value;
  }

  return "timeout";
}

export async function requestDeviceLocation(): Promise<Coordinates> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("unsupported");
  }

  if (!window.isSecureContext) {
    throw new Error("insecure");
  }

  const attempts: Array<() => Promise<Coordinates>> = [
    () =>
      getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }),
    () =>
      watchPositionOnce(
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 20000,
        },
        20000
      ),
    () =>
      getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 120000,
      }),
  ];

  let lastError: DeviceLocationErrorCode = "timeout";

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      lastError = toDeviceLocationErrorCode(error);
      if (lastError === "denied" || lastError === "insecure" || lastError === "unsupported") {
        throw new Error(lastError);
      }
    }
  }

  throw new Error(lastError);
}
