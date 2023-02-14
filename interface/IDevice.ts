export interface IDevice {
    device_name: string,
    description: string,
    plug_id: string  // obviously inteded as a foreign key despite using non-relational db.
}