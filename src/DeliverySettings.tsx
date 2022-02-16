import { Money } from "./AreaParamsResponse";

export interface deliverySettings {
  context: "DIGITAL_CATALOG" | "DEFAULT";
  areas: string[];
  parameters: {
    sequence: number;
    range: number;
    money: Money;
    time: number;
  }[];
}
