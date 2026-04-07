import {
  Filters,
  StatusFilters,
  EntityTypeFilters,
  DateRangeFilters,
  AssigneeFilters,
  AssignerFilters,
} from "./types";

export const defaultStatus: StatusFilters = {
  pending: false,
  inProcess: false,
  completed: false,
  onHold: false,
  delayed: false,
  created: false,
};

export const defaultEntityType: EntityTypeFilters = {
  llp: false,
  opcs: false,
  privateIndividual: false,
  privateCorporate: false,
  publicIndividual: false,
  publicCorporate: false,
  foreignIndividual: false,
};

export const defaultDateRange: DateRangeFilters = {
  today: false,
  lastWeek: false,
  lastMonth: false,
  lastYear: false,
};

export const defaultAssignee: AssigneeFilters = {
  selected: [],
};

export const defaultAssigner: AssignerFilters = {
  selected: [],
};
