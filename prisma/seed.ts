import 'dotenv/config';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
  // Languages
  const english = await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: { name: 'English', code: 'en', description: 'English language' },
  });

  const spanish = await prisma.language.upsert({
    where: { code: 'es' },
    update: {},
    create: { name: 'Spanish', code: 'es', description: 'Spanish language' },
  });

  const french = await prisma.language.upsert({
    where: { code: 'fr' },
    update: {},
    create: { name: 'French', code: 'fr', description: 'French language' },
  });

  // Language pair: English speakers learning Spanish
  const enToEs = await prisma.languagePair.upsert({
    where: {
      knownLanguageId_targetLanguageId: {
        knownLanguageId: english.id,
        targetLanguageId: spanish.id,
      },
    },
    update: {},
    create: {
      knownLanguageId: english.id,
      targetLanguageId: spanish.id,
    },
  });

  // English speakers learning French
  const enToFr = await prisma.languagePair.upsert({
    where: {
      knownLanguageId_targetLanguageId: {
        knownLanguageId: english.id,
        targetLanguageId: french.id,
      },
    },
    update: {},
    create: {
      knownLanguageId: english.id,
      targetLanguageId: french.id,
    },
  });

  // Course for English -> Spanish
  const spanishBeginnerCourse = await prisma.course.create({
    data: {
      languagePairId: enToEs.id,
      title: 'Spanish for Beginners',
      level: 'beginner',
      order: 1,
      modules: {
        create: [
          {
            title: 'Greetings & Introductions',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Saying Hello',
                  content: 'Learn how to greet people in Spanish: Hola, Buenos días, ¿Cómo estás?',
                  order: 1,
                  estimatedMinutes: 10,
                  vocabulary: {
                    create: [
                      { word: 'Hola', translation: 'Hello', pronunciation: 'OH-lah' },
                      { word: 'Buenos días', translation: 'Good morning', pronunciation: 'BWEH-nos DEE-as' },
                      { word: 'Gracias', translation: 'Thank you', pronunciation: 'GRAH-see-as' },
                    ],
                  },
                  quizzes: {
                    create: [
                      {
                        title: 'Greetings Quiz',
                        passThreshold: 70,
                        questions: {
                          create: [
                            {
                              type: 'MULTIPLE_CHOICE',
                              prompt: 'How do you say "Hello" in Spanish?',
                              order: 1,
                              answers: {
                                create: [
                                  { text: 'Hola', isCorrect: true },
                                  { text: 'Adiós', isCorrect: false },
                                  { text: 'Gracias', isCorrect: false },
                                  { text: 'Buenas noches', isCorrect: false },
                                ],
                              },
                            },
                            {
                              type: 'MULTIPLE_CHOICE',
                              prompt: 'What does "Gracias" mean?',
                              order: 2,
                              answers: {
                                create: [
                                  { text: 'Please', isCorrect: false },
                                  { text: 'Thank you', isCorrect: true },
                                  { text: 'Goodbye', isCorrect: false },
                                  { text: 'Sorry', isCorrect: false },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  title: 'Introducing Yourself',
                  content: 'Learn to introduce yourself: Me llamo..., Soy de...',
                  order: 2,
                  estimatedMinutes: 12,
                  vocabulary: {
                    create: [
                      { word: 'Me llamo', translation: 'My name is', pronunciation: 'meh YAH-mo' },
                      { word: 'Soy de', translation: 'I am from', pronunciation: 'soy deh' },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Subscription plans
  await prisma.plan.upsert({
    where: { id: 'free-plan-seed' },
    update: {},
    create: {
      id: 'free-plan-seed',
      name: 'Free',
      price: 0,
      durationMonths: 0,
      features: ['Access to first module of each course', 'Limited quizzes'],
    },
  });

  await prisma.plan.upsert({
    where: { id: 'monthly-plan-seed' },
    update: {},
    create: {
      id: 'monthly-plan-seed',
      name: 'Monthly Pro',
      price: 4999,
      durationMonths: 1,
      features: ['Full course access', 'Unlimited quizzes', 'Progress tracking'],
    },
  });

  await prisma.plan.upsert({
    where: { id: 'annual-plan-seed' },
    update: {},
    create: {
      id: 'annual-plan-seed',
      name: 'Annual Pro',
      price: 39999,
      durationMonths: 12,
      features: ['Full course access', 'Unlimited quizzes', 'Progress tracking', '2 months free'],
    },
  });

  console.log('✅ Seed complete');
  console.log({ english, spanish, french, enToEs, enToFr, spanishBeginnerCourse });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });