export interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  date: string;
  urgent: boolean;
}

export interface Flashcard {
  id: string;
  character: string;
  pinyin: string;
  translation: string;
  example_sentence?: string;
}

export interface ScheduleItem {
  id: string;
  day: string;
  start_time: string;
  subject: string;
  room?: string;
  order: number;
}

export interface HomeworkItem {
  id: string;
  content: string;
  due_date?: string;
  is_done: boolean;
}

export enum ViewState {
  HOME = 'HOME',
  FLASHCARDS = 'FLASHCARDS',
  SCHEDULE = 'SCHEDULE',
  HOMEWORK = 'HOMEWORK'
}
