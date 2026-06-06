import { DEFAULT_LANGUAGE } from '@/features/story-projects/config/formOptions'
import type { TeacherTemplate } from '../types/teacherTemplate.types'
import { buildTeacherTemplate } from './teacherTemplateUtils'

const BUILT_IN_UPDATED_AT = '2026-01-01T00:00:00.000Z'

export const BUILT_IN_TEACHER_TEMPLATE_IDS = {
  fieldTrip: 'builtin-field-trip',
  phonics: 'builtin-phonics',
  roleplay: 'builtin-roleplay',
  sel: 'builtin-sel',
} as const

export const builtInTeacherTemplates: TeacherTemplate[] = [
  buildTeacherTemplate({
    id: BUILT_IN_TEACHER_TEMPLATE_IDS.fieldTrip,
    name: 'Field trip template',
    description: 'Prepare students for a community visit with safety words and story flow.',
    category: 'field-trip',
    isBuiltIn: true,
    createdAt: BUILT_IN_UPDATED_AT,
    updatedAt: BUILT_IN_UPDATED_AT,
    preferences: {
      storyPurpose: 'Field trip preparation',
      storyTone: 'Warm',
      ageRange: '4-6',
      language: DEFAULT_LANGUAGE,
      pageCount: 12,
    },
    vocabularyTargets: {
      lessonGoal: 'Learn trip vocabulary and describe what to expect on a community visit.',
      vocabularyFocus: 'Name the destination, follow safety rules, retell the visit plan.',
      wordsToInclude: 'field trip, bus, safety, community helper, explore, listen',
      wordsToAvoid: '',
    },
    setupFields: {
      theme: 'Preparing for a class field trip',
      setting: 'Classroom and community destination',
      mainEvents: `Teacher explains the field trip plan
Class reviews safety rules together
Students travel to the destination
Guide introduces the community space
Students explore with a partner
Class shares favorite moments back at school`,
      characters: 'Nina (older sibling)\nNino (younger sibling)\nMs. Lee (teacher)\nCommunity guide',
      notes: 'Keep tone calm and reassuring. Highlight listening and staying with the group.',
    },
  }),
  buildTeacherTemplate({
    id: BUILT_IN_TEACHER_TEMPLATE_IDS.phonics,
    name: 'Phonics template',
    description: 'Spotlight target sounds and decodable words in a short classroom story.',
    category: 'phonics',
    isBuiltIn: true,
    createdAt: BUILT_IN_UPDATED_AT,
    updatedAt: BUILT_IN_UPDATED_AT,
    preferences: {
      storyPurpose: 'Introduce vocabulary',
      storyTone: 'Classroom-friendly',
      ageRange: '4-6',
      language: DEFAULT_LANGUAGE,
      pageCount: 10,
    },
    vocabularyTargets: {
      lessonGoal: 'Hear and recognize the target sound in story words.',
      vocabularyFocus: 'Blend sounds, read decodable words, clap syllables.',
      wordsToInclude: 'cat, map, sat, tap, cap',
      wordsToAvoid: 'complex spellings outside the current phonics pattern',
    },
    setupFields: {
      theme: 'Finding words with our target sound',
      setting: 'Classroom reading corner',
      mainEvents: `Teacher introduces the target sound
Students hunt for words around the room
Friends build words together with letter cards
They read a short story using the words
Students share a word they heard in the story`,
      characters: 'Nina\nNino\nReading buddy group',
      notes: 'Repeat target words naturally across pages. Keep sentences short and decodable.',
    },
  }),
  buildTeacherTemplate({
    id: BUILT_IN_TEACHER_TEMPLATE_IDS.roleplay,
    name: 'Roleplay template',
    description: 'Practice social scripts and classroom roles through dialogue-friendly scenes.',
    category: 'roleplay',
    isBuiltIn: true,
    createdAt: BUILT_IN_UPDATED_AT,
    updatedAt: BUILT_IN_UPDATED_AT,
    preferences: {
      storyPurpose: 'Roleplay practice',
      storyTone: 'Funny',
      ageRange: '4-6',
      language: DEFAULT_LANGUAGE,
      pageCount: 10,
    },
    vocabularyTargets: {
      lessonGoal: 'Practice polite words and turn-taking in a familiar scenario.',
      vocabularyFocus: 'Use greeting phrases, ask for help, and respond with kind words.',
      wordsToInclude: 'please, thank you, excuse me, share, turn, help',
      wordsToAvoid: '',
    },
    setupFields: {
      theme: 'Trying a new classroom roleplay',
      setting: 'Dramatic play area and classroom',
      mainEvents: `Students choose roles for the scene
Characters greet each other politely
A small problem appears during play
Friends use kind words to solve it
Class reflects on what worked well`,
      characters: 'Shopkeeper\nCustomer\nHelper\nNarrator',
      notes: 'Leave room for short dialogue lines teachers can act out with students.',
    },
  }),
  buildTeacherTemplate({
    id: BUILT_IN_TEACHER_TEMPLATE_IDS.sel,
    name: 'SEL template',
    description: 'Social-emotional learning story with feelings vocabulary and reflection.',
    category: 'sel',
    isBuiltIn: true,
    createdAt: BUILT_IN_UPDATED_AT,
    updatedAt: BUILT_IN_UPDATED_AT,
    preferences: {
      storyPurpose: 'Social-emotional lesson',
      storyTone: 'Calm',
      ageRange: '4-6',
      language: DEFAULT_LANGUAGE,
      pageCount: 12,
    },
    vocabularyTargets: {
      lessonGoal: 'Name feelings and try a helpful strategy when something feels hard.',
      vocabularyFocus: 'Identify emotions, breathe, ask for help, repair with a friend.',
      wordsToInclude: 'feelings, worried, calm, breathe, kind, together',
      wordsToAvoid: '',
    },
    setupFields: {
      theme: 'Naming feelings and choosing a helpful response',
      setting: 'Classroom, playground, and cozy calm corner',
      mainEvents: `Character notices a big feeling
Teacher or friend names the feeling kindly
They try a calming strategy together
The character makes a brave kind choice
Class talks about what helps when feelings are big`,
      characters: 'Nina\nNino\nClassmate Sam\nMs. Lee',
      notes: 'Avoid blame language. Model co-regulation and simple repair steps.',
    },
  }),
]

export function getBuiltInTeacherTemplate(id: string): TeacherTemplate | undefined {
  return builtInTeacherTemplates.find((template) => template.id === id)
}
