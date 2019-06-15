export interface UniversityClass {
  time: string;
  subject: string;
}

export interface Timetable {
  week: string;
  schedule: {
    [key in string]: UniversityClass[];
  };
}
