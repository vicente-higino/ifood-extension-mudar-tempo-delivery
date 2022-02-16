import axios from "axios";
import { AreaAttendingResponse } from "./AreaAttendingResponse";
import { IAreaParams } from "./AreaParamsResponse";
import { deliverySettings } from "./DeliverySettings";

export const getAreasAttending = async (restaurantId: string, token: string) => {
  return await axios.get<AreaAttendingResponse>(
    `https://portal-api.ifood.com.br/next-web-bff/delivery-area/attending?restaurantUUID=${restaurantId}&context=DEFAULT,DIGITAL_CATALOG`,
    {
      headers: { Accept: "application/json", authorization: `Bearer ${token}` },
    }
  );
};
export const getAreasParams = async (ctx: "DIGITAL_CATALOG" | "DEFAULT", restaurantId: string, token: string) => {
  return await axios.get<IAreaParams[]>(
    `https://portal-api.ifood.com.br/next-web-bff/delivery-parameters?restaurantId=${restaurantId}&context=${ctx}`,
    {
      headers: { Accept: "application/json", authorization: `Bearer ${token}` },
    }
  );
};
export const saveAreas = (data: deliverySettings, restaurantId: string, token: string) => {
  axios.post(`https://portal-api.ifood.com.br/next-web-bff/restaurants/${restaurantId}/delivery-settings`, data, {
    headers: { authorization: `Bearer ${token}` },
  });
};
export const prepareData = (
  context: "DIGITAL_CATALOG" | "DEFAULT",
  areas: string[],
  params: IAreaParams[],
  incTime: number = 0
): deliverySettings => {
  return {
    context,
    areas,
    parameters: params.map((p) => {
      return {
        sequence: p.sequence,
        range: p.sequence,
        money: p.money,
        time: p.time + incTime,
      };
    }),
  };
};
export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const last = parts.pop();
    return last ? last.split(";").shift() : false;
  }
  return false;
}
