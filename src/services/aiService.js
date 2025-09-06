// AI service stubs for Summarizer, MCQ, Flashcards, Internship Matching
import { AIJobs } from './firestoreData';
import Toast from '../components/common/Toast';

const DEV_DELAY = 1200;

const devDelay = (result) => new Promise((res) => setTimeout(() => res(result), DEV_DELAY));

const fakeSummary = (text) => ({
  bullets: [
    'Core concepts extracted from the material.',
    'Important definitions and relationships.',
    'Notable formulas and theorems.',
  ],
  tldr: 'In short, this material covers the fundamentals and key takeaways with practical examples.',
  keyTerms: ['Concept A', 'Concept B', 'Theorem C']
});

const fakeMCQ = (text, n = 5) => Array.from({ length: n }).map((_, i) => ({
  id: i + 1,
  question: `Sample question ${i + 1}?`,
  choices: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctIndex: 1,
  explanation: 'Because of the definition and properties discussed in the text.'
}));

const fakeFlashcards = (text, n = 10) => Array.from({ length: n }).map((_, i) => ({
  front: `Term ${i + 1}`,
  back: `Definition for term ${i + 1}`,
}));

export const AIService = {
  async summarize({ noteId, inputText, createdBy }) {
    const jobId = await AIJobs.create({ type: 'summary', noteId, inputText, status: 'queued', createdBy });
    // Placeholder: replace with call to serverless/LLM endpoint then update job
    const output = await devDelay(fakeSummary(inputText || 'Note content'));
    await AIJobs.update(jobId, { status: 'completed', output });
    Toast.success('AI summary ready');
    return jobId;
  },

  async generateMCQ({ inputText, count = 10, createdBy }) {
    const jobId = await AIJobs.create({ type: 'mcq', inputText, status: 'queued', createdBy });
    const output = await devDelay(fakeMCQ(inputText || 'Note content', count));
    await AIJobs.update(jobId, { status: 'completed', output });
    Toast.success('MCQs generated');
    return jobId;
  },

  async flashcards({ inputText, count = 20, createdBy }) {
    const jobId = await AIJobs.create({ type: 'flashcard', inputText, status: 'queued', createdBy });
    const output = await devDelay(fakeFlashcards(inputText || 'Note content', count));
    await AIJobs.update(jobId, { status: 'completed', output });
    Toast.success('Flashcards ready');
    return jobId;
  },

  // Simple match based on overlap count between user skills and internship skills
  matchInternships({ userSkills = [], internships = [] }) {
    const set = new Set(userSkills.map((s) => s.toLowerCase()));
    return internships
      .map((i) => ({
        ...i,
        matchScore: (i.skills || []).reduce((acc, s) => acc + (set.has(String(s).toLowerCase()) ? 1 : 0), 0),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  },
};

