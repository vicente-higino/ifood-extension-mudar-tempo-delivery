export interface AreaAttendingResponse {
  type: string;
  features: Feature[];
}

interface Feature {
  type: string;
  properties: Properties;
  geometry: Geometry;
}

interface Geometry {
  type: string;
  coordinates: number[][][];
}

interface Properties {
  country: string;
  isAttending: boolean;
  city: string;
  setup: string;
  label: string;
  state: string;
  id: string;
  areasnilson: boolean;
}
