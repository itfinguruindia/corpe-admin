// Types for FilterDropdown

export type StatusFilters = {
  created: boolean;
  pending: boolean;
  inProcess: boolean;
  completed: boolean;
  onHold: boolean;
  delayed: boolean;
};

export type EntityTypeFilters = {
  llp: boolean;
  opcs: boolean;
  privateIndividual: boolean;
  privateCorporate: boolean;
  publicIndividual: boolean;
  publicCorporate: boolean;
  foreignIndividual: boolean;
};

export type DateRangeFilters = {
  today: boolean;
  lastWeek: boolean;
  lastMonth: boolean;
  lastYear: boolean;
};

export type User = {
  id: string;
  name: string;
};

export type AssigneeFilters = {
  selected: User[];
};

export type AssignerFilters = {
  selected: User[];
};

export type Filters = {
  status: StatusFilters;
  entityType: EntityTypeFilters;
  dateRange: DateRangeFilters;
  assignee: AssigneeFilters;
  assigner: AssignerFilters;
  search?: string;
};
