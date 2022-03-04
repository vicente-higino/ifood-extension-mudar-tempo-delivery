export interface Merchant {
  id: number;
  salesforceId: string;
  uuid: string;
  name: string;
  email: string;
  address: string;
  shortAddress: string;
  deliveryPhone: string;
  ownerPhone?: any;
  minimumOrderValue: MinimumOrderValue;
  averageTicket: MinimumOrderValue;
  location: Location;
  description: string;
  mainCuisine: string;
  secondaryCuisine: string;
  signingUp: boolean;
  recentEnabledAt: string;
  deliveryTime: number;
  takeoutTime: number;
  unavailable: boolean;
  logo: Logo;
  timezone: string;
  locale: string;
  country: string;
  state: string;
  city: string;
  district: string;
  cover: Logo;
  restaurantClassification: string;
  companyCode: string;
  storeType: string;
  businessModel: string;
  statusAvailability: string;
  billingType: BillingType;
  isChurn: boolean;
  logicNumber: string;
  performanceClassification: string;
}

interface BillingType {
  code: string;
  name: string;
  days: string;
}

interface Logo {
  baseUrl: string;
  path: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface MinimumOrderValue {
  currency: string;
  value: number;
}

export default () => {
  const m = localStorage["get-merchant"];
  return m ? JSON.parse(m) as Merchant : false
};
