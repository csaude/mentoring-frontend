export default class TutorInternalLocation {
  id?: number;
  uuid?: string;

  healthFacility: any | null;
  startDate: Date | null;
  endDate: Date | null;

  constructor(data: Partial<TutorInternalLocation>) {
    this.id = data.id;
    this.uuid = data.uuid;
    this.healthFacility = data.healthFacility ?? null;
    this.startDate = data.startDate ? new Date(data.startDate) : null;
    this.endDate = data.endDate ? new Date(data.endDate) : null;
  }

  get isActive(): boolean {
    return !this.endDate;
  }
}
