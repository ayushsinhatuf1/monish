// ============================================================
// Monish – Shared Constants
// ============================================================

// Quiz Status
export const QUIZ_STATUS = {
  UPCOMING: 'upcoming',
  FILLING: 'filling',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Quiz Categories
export const QUIZ_CATEGORIES = [
  'general',
  'science',
  'technology',
  'sports',
  'entertainment',
  'history',
  'geography',
  'current_affairs',
  'bollywood',
  'cricket',
] as const;

export const QUIZ_CATEGORY_LABELS: Record<string, string> = {
  general: 'General Knowledge',
  science: 'Science',
  technology: 'Technology',
  sports: 'Sports',
  entertainment: 'Entertainment',
  history: 'History',
  geography: 'Geography',
  current_affairs: 'Current Affairs',
  bollywood: 'Bollywood',
  cricket: 'Cricket',
};

// Payment / Transaction
export const TRANSACTION_TYPE = {
  CREDIT: 'credit',
  DEBIT: 'debit',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const;

// Prize
export const RANK_LABELS = {
  BUMPER: 'bumper',
  FIRST: '1st',
  SECOND: '2nd',
  THIRD: '3rd',
  CONSOLATION: 'consolation',
} as const;

export const PRIZE_TYPES = {
  CASH: 'cash',
  GIFT: 'gift',
  WALLET_CREDIT: 'wallet_credit',
} as const;

// Socket Events
export const SOCKET_EVENTS = {
  // Quiz events
  QUIZ_PARTICIPANT_JOINED: 'quiz:participant_joined',
  QUIZ_THRESHOLD_REACHED: 'quiz:threshold_reached',
  QUIZ_STARTED: 'quiz:started',
  QUIZ_CANCELLED: 'quiz:cancelled',
  QUIZ_WINNER_ANNOUNCED: 'quiz:winner_announced',
  QUIZ_TIMER_TICK: 'quiz:timer_tick',

  // User events
  USER_WALLET_UPDATED: 'user:wallet_updated',
  USER_NOTIFICATION: 'user:notification',

  // Room events
  JOIN_QUIZ_ROOM: 'room:join_quiz',
  LEAVE_QUIZ_ROOM: 'room:leave_quiz',
  JOIN_USER_ROOM: 'room:join_user',
} as const;

// API Routes
export const API_ROUTES = {
  // Auth
  SEND_OTP: '/api/auth/send-otp',
  VERIFY_OTP: '/api/auth/verify-otp',
  REFRESH_TOKEN: '/api/auth/refresh-token',

  // User
  USER_ME: '/api/users/me',
  USER_STATS: '/api/users/me/stats',
  USER_REFERRALS: '/api/users/me/referrals',

  // Wallet
  WALLET_BALANCE: '/api/wallet/balance',
  WALLET_TRANSACTIONS: '/api/wallet/transactions',
  WALLET_ADD_MONEY: '/api/wallet/add-money',
  WALLET_WITHDRAW: '/api/wallet/withdraw',
  WALLET_VERIFY_PAYMENT: '/api/wallet/verify-payment',

  // Quiz
  QUIZZES: '/api/quizzes',
  QUIZ_DETAIL: '/api/quizzes/:id',
  QUIZ_JOIN: '/api/quizzes/:id/join',
  QUIZ_QUESTIONS: '/api/quizzes/:id/questions',
  QUIZ_SUBMIT: '/api/quizzes/:id/submit',
  QUIZ_RESULT: '/api/quizzes/:id/result',
  QUIZ_WINNERS: '/api/quizzes/:id/winners',

  // Winners
  WINNERS: '/api/winners',

  // Admin
  ADMIN_QUIZZES: '/api/admin/quizzes',
  ADMIN_QUIZ_DETAIL: '/api/admin/quizzes/:id',
  ADMIN_QUIZ_CANCEL: '/api/admin/quizzes/:id/cancel',
  ADMIN_ANNOUNCE_WINNERS: '/api/admin/quizzes/:id/announce-winners',
  ADMIN_REVENUE: '/api/admin/revenue',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_BLOCK: '/api/admin/users/:id/block',
  ADMIN_WITHDRAWALS: '/api/admin/withdrawals',
  ADMIN_WITHDRAWAL_APPROVE: '/api/admin/withdrawals/:id/approve',
  ADMIN_LOGIN: '/api/admin/login',
} as const;

// App Config
export const APP_CONFIG = {
  MIN_WITHDRAWAL: 100, // ₹100 minimum withdrawal
  MAX_WITHDRAWAL: 50000, // ₹50,000 max per withdrawal
  REFERRAL_BONUS: 25, // ₹25 referral bonus
  OTP_EXPIRY_SECONDS: 300, // 5 minutes
  JWT_ACCESS_EXPIRY: '7d',
  JWT_REFRESH_EXPIRY: '30d',
  DEFAULT_QUESTION_TIME: 15, // seconds
  MAX_QUESTIONS_PER_QUIZ: 20,
  PRIZE_POOL_MIN_PERCENT: 30,
  PRIZE_POOL_MAX_PERCENT: 40,
  RAZORPAY_CURRENCY: 'INR',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  QUIZ_STARTING_SOON: 'quiz_starting_soon',
  QUIZ_FILLED: 'quiz_filled',
  QUIZ_CANCELLED: 'quiz_cancelled',
  RESULT_ANNOUNCED: 'result_announced',
  WINNER_ANNOUNCED: 'winner_announced',
  WALLET_CREDIT: 'wallet_credit',
  REFERRAL_BONUS: 'referral_bonus',
} as const;
