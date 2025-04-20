import { Language } from 'src/schemas/word.schema';

export const ExamType = [
  { language: Language.English, exams: ['TOEFL', 'IELTS', 'TOEIC'] },
  { language: Language.German, exams: ['Goethe', 'TestDaF'] },
  { language: Language.French, exams: ['DELF', 'DALF'] },
  { language: Language.Spanish, exams: ['DELE', 'DALF'] },
  { language: Language.Italian, exams: ['CILS', 'CELI'] },
  { language: Language.Portuguese, exams: ['CILS', 'CELI'] },
  { language: Language.Russian, exams: ['TORFL', 'TORFL-B'] },
];

export const Interests = [
  'Travel',
  'Business',
  'Culture',
  'Technology',
  'Science',
  'History',
  'Video Games',
  'Anime',
  'Movies',
  'Relationship',
  'Books',
  'Dating',
  'Art',
  'Music',
  'Sports',
  'Food',
  'Health',
  'Other',
];
