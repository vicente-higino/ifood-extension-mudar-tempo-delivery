export interface IAreaParams {
  sequence: number;
  distance: number;
  time: number;
  money: Money;
  label: string;
  deliveryBy: string;
}

export interface Money {
  currency: string;
  value: number;
}
