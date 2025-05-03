import { Course } from 'src/schemas/language/language-course.schema';

export enum LanguagePlan {
  Grammar = 'grammar',
  Vocabulary = 'vocabulary',
  Reading = 'reading',
  Writing = 'writing',
  Listening = 'listening',
  Speaking = 'speaking',
  Conversation = 'conversation',
}

export const Plans = [
  {
    course: Course.Language,
    plans: [
      LanguagePlan.Grammar,
      LanguagePlan.Vocabulary,
      LanguagePlan.Reading,
      LanguagePlan.Writing,
      LanguagePlan.Listening,
      LanguagePlan.Speaking,
      LanguagePlan.Conversation,
    ],
  },
];

export const ConversationPlans = [
  'work',
  'school',
  'family',
  'hobby',
  'food',
  'greeting',
  'reserve a table in a restaurant',
  'ask for directions',
  'ask for help',
  'airport',
  'hotel',
  'restaurant',
  'shopping',
  'bank',
  'hospital',
  'game',
  'music',
  'movie',
  'travel',
  'weather',
  'news',
  'sports',
  'politics',
  'economy',
  'science',
  'technology',
  'art',
  'culture',
];
