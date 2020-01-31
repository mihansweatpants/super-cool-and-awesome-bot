export interface UniversityClass {
  time: string;
  subject: string;
}

export interface Timetable {
  weekNum: number;
  schedule: {
    [key: string]: UniversityClass[];
  };
}
