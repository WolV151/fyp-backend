import { IConsumptionSeries } from "./IConsumptionSeries"

export interface IDataSeries {
    name: string,
    series: IConsumptionSeries[]
}