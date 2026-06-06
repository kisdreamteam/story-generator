import type {
  AIImagePromptOutput,
  AIStoryCoreOutput,
  AIStoryFlashcardOutput,
  AIStoryGenerationResult,
  AIStoryPageOutput,
} from '../../types'

export const MOCK_AI_GENERATION_MS = 1500
export const MOCK_AI_GENERATED_AT = '2026-06-06T14:00:00.000Z'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

const pageTexts: Omit<AIStoryPageOutput, 'wordCount'>[] = [
  {
    pageNumber: 1,
    text: 'Nina and Nino arrived at school with big smiles. Today was field trip day! Their teacher, Ms. Lee, said, "We are visiting the fire station."',
    teachingFocus: 'Introduce field trip and excitement vocabulary.',
  },
  {
    pageNumber: 2,
    text: 'The class lined up quietly. Nina held Nino\'s hand. Together they walked to the bright red building downtown. "Look!" said Nino. "That is the fire station."',
    teachingFocus: 'Practice location words and polite group behavior.',
  },
  {
    pageNumber: 3,
    text: 'Firefighter Ana opened the door. "Welcome, friends," she said. Nina waved hello. Nino said, "Thank you for having us." The children felt safe and welcome.',
    teachingFocus: 'Model greetings and community helper vocabulary.',
  },
  {
    pageNumber: 4,
    text: 'Inside the bay, a big fire truck shone red and clean. Nina read the words on the side. Nino pointed at the long ladder. "It goes up high," he whispered.',
    teachingFocus: 'Name fire station objects and describe size.',
  },
  {
    pageNumber: 5,
    text: 'Firefighter Ana let Nino try on a helmet. It was heavy! Nina helped buckle the chin strap. "Firefighters wear special gear to stay safe," Ana explained.',
    teachingFocus: 'Introduce safety equipment and helping others.',
  },
  {
    pageNumber: 6,
    text: 'The class practiced "Stop, drop, and roll" on soft mats. Nina rolled carefully. Nino giggled, then rolled too. "Good job," said Ms. Lee. "That keeps you safe if clothes catch a spark."',
    teachingFocus: 'Teach a simple safety routine with action words.',
  },
  {
    pageNumber: 7,
    text: 'Outside, firefighters showed how a hose sprays water. Mist sparkled in the sun. Nina and Nino stayed behind the safety line. "Never play with fire," Ana reminded them.',
    teachingFocus: 'Reinforce safety rules and observation language.',
  },
  {
    pageNumber: 8,
    text: 'In the kitchen corner, Ana talked about smoke alarms. "If you hear beep-beep-beep, tell a grown-up," she said. Nina nodded. Nino repeated, "Tell a grown-up."',
    teachingFocus: 'Connect home safety to school learning.',
  },
  {
    pageNumber: 9,
    text: 'Each child received a sticker badge. Nino stuck his on his shirt. Nina placed hers in her notebook. "I am a junior fire safety helper," Nina said proudly.',
    teachingFocus: 'Celebrate learning and use proud, positive language.',
  },
  {
    pageNumber: 10,
    text: 'Ana showed the number to call in an emergency. Nina practiced saying it slowly with the class. "Only for real emergencies," Ms. Lee added. Nino listened with wide eyes.',
    teachingFocus: 'Introduce emergency help in an age-appropriate way.',
  },
  {
    pageNumber: 11,
    text: 'Before leaving, the class said thank you together. Firefighter Ana waved from the truck bay. Nina and Nino walked back to school, talking about helmets, hoses, and safety.',
    teachingFocus: 'Practice gratitude and retelling key moments.',
  },
  {
    pageNumber: 12,
    text: 'At story time, Nina shared what she learned. Nino added, "Firefighters help people." Ms. Lee smiled. "You were brave, curious, and kind today." Nina and Nino felt proud.',
    teachingFocus: 'Close with reflection and social-emotional vocabulary.',
  },
]

const storyPages: AIStoryPageOutput[] = pageTexts.map((page) => ({
  ...page,
  wordCount: countWords(page.text),
}))

const mockFlashcards: AIStoryFlashcardOutput[] = [
  {
    word: 'fire station',
    simpleDefinition: 'a place where firefighters work and keep their trucks',
    exampleSentence: 'That is the fire station.',
  },
  {
    word: 'firefighter',
    simpleDefinition: 'a person who helps put out fires and keeps people safe',
    exampleSentence: 'Firefighter Ana opened the door.',
  },
  {
    word: 'fire truck',
    simpleDefinition: 'a big red vehicle firefighters use',
    exampleSentence: 'A big fire truck shone red and clean.',
  },
  {
    word: 'helmet',
    simpleDefinition: 'hard hat that protects your head',
    exampleSentence: 'Firefighter Ana let Nino try on a helmet.',
  },
  {
    word: 'hose',
    simpleDefinition: 'a long tube that sprays water',
    exampleSentence: 'Firefighters showed how a hose sprays water.',
  },
  {
    word: 'safety',
    simpleDefinition: 'being protected from harm',
    exampleSentence: 'That keeps you safe if clothes catch a spark.',
  },
  {
    word: 'emergency',
    simpleDefinition: 'a serious situation when someone needs help fast',
    exampleSentence: 'Only for real emergencies.',
  },
  {
    word: 'uniform',
    simpleDefinition: 'special clothes worn for a job',
    exampleSentence: 'Firefighters wear special gear to stay safe.',
  },
]

const CONTINUITY = 'Nina (older) in indigo, Nino (younger) in emerald green; warm watercolor style'

const mockImagePrompts: AIImagePromptOutput[] = [
  {
    pageNumber: 1,
    prompt: 'Excited classmates in a sunny classroom, Nina and Nino listening to teacher announce fire station trip',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 2,
    prompt: 'Children walking in a line toward a red fire station building, Nina holding Nino\'s hand',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 3,
    prompt: 'Friendly firefighter greeting children at fire station entrance, warm welcoming scene',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 4,
    prompt: 'Large red fire truck inside station bay, Nina and Nino looking up at ladder',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 5,
    prompt: 'Younger child trying on firefighter helmet with help from older sibling and firefighter',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 6,
    prompt: 'Children practicing stop-drop-and-roll on mats inside fire station',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 7,
    prompt: 'Firefighter demonstrating water hose outdoors, children watching behind safety line',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 8,
    prompt: 'Firefighter pointing to smoke alarm in demo kitchen, attentive children nearby',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 9,
    prompt: 'Children with junior firefighter sticker badges, smiling in fire station',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 10,
    prompt: 'Teacher and firefighter teaching emergency number practice, calm classroom-style grouping',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 11,
    prompt: 'Children waving goodbye to firefighter at station, walking back toward school',
    continuityReminder: CONTINUITY,
  },
  {
    pageNumber: 12,
    prompt: 'Nina and Nino sharing field trip story in classroom circle time, proud and happy',
    continuityReminder: CONTINUITY,
  },
]

const totalWordCount = storyPages.reduce((total, page) => total + page.wordCount, 0)

export function buildMockAIStoryCore(): AIStoryCoreOutput {
  return {
    title: 'Nina and Nino Visit the Fire Station',
    summary:
      'Nina and Nino join their class on a field trip to the fire station. They meet firefighters, explore a fire truck, practice safety skills, and learn how community helpers keep people safe.',
    storyPages,
    totalWordCount,
    generatedAt: MOCK_AI_GENERATED_AT,
  }
}

export function buildMockAIStoryGenerationResult(): AIStoryGenerationResult {
  return {
    story: buildMockAIStoryCore(),
    flashcards: mockFlashcards,
  }
}

/** Static mock image prompts used by the dashboard flow today. */
export function getMockAIImagePrompts(): AIImagePromptOutput[] {
  return mockImagePrompts
}
