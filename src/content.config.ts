import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro:schema';

const courses = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    order: z.number(),
    lessonCount: z.number(),
    status: z.enum(['active', 'coming-soon']),
  }),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    course: z.string(),
    order: z.number(),
    description: z.string(),
  }),
});

const quizzes = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/quizzes' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    course: z.string(),
    description: z.string(),
    questions: z.array(
      z.object({
        id: z.number(),
        scenario: z.string(),
        question: z.string(),
        choices: z.array(z.string()).length(4),
        correctIndex: z.number().min(0).max(3),
        explanation: z.string(),
      })
    ),
  }),
});

export const collections = { courses, lessons, quizzes };
