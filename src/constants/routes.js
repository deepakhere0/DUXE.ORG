export const ROUTES = {
  // Public
  HOME: '/',
  NOTES: '/notes',
  NOTE_DETAIL: '/notes/:noteId',
  VIDEOS: '/videos',
  INTERNSHIPS: '/internships',
  TOOLS: '/tools',
  PRICING: '/pricing',

  // Auth (no layout)
  LOGIN: '/login',
  SIGNUP: '/signup',
  PDF_PREVIEW: '/preview/:id',

  // Protected
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  PENDING: '/pending',

  // Admin
  ADMIN_REVIEW: '/admin/review',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PAYMENTS: '/admin/payments',

  // Static / Info
  HOW_IT_WORKS: '/how-it-works',
  FAQ: '/faq',
  BLOG: '/blog',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COOKIES: '/cookies',
  HELP: '/help',
  GUIDELINES: '/guidelines',
  REPORT: '/report',
  FEEDBACK: '/feedback',

  // Dev only
  TEST_DATACONNECT: '/test-dataconnect',
  DEBUG: '/debug',
};
