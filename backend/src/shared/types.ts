// ============================================================
// Monish – Shared TypeScript Types
// ============================================================

// ---------- User ----------
export interface User {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  avatar: string | null;
  walletBalance: number;
  referralCode: string;
  referredBy: string | null;
  totalWinnings: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserStats {
  quizzesPlayed: number;
  quizzesWon: number;
  totalWinnings: number;
  winRate: number;
}

// ---------- Wallet ----------
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  totalAdded: number;
  totalWithdrawn: number;
  totalSpent: number;
}

export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId: string | null;
  status: TransactionStatus;
  createdAt: string;
}

// ---------- Quiz ----------
export type QuizStatus = 'upcoming' | 'filling' | 'active' | 'completed' | 'cancelled';
export type QuizCategory = 'general' | 'science' | 'technology' | 'sports' | 'entertainment' | 'history' | 'geography' | 'current_affairs' | 'bollywood' | 'cricket';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: QuizCategory;
  entryFee: number;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  prizePoolPercentage: number;
  status: QuizStatus;
  startTime: string;
  endTime: string | null;
  durationSeconds: number;
  createdBy: string;
  createdAt: string;
  prizeStructure?: PrizeStructure[];
  questions?: Question[];
}

// ---------- Prize ----------
export type RankLabel = 'bumper' | '1st' | '2nd' | '3rd' | 'consolation';
export type PrizeType = 'cash' | 'gift' | 'wallet_credit';

export interface PrizeStructure {
  id: string;
  quizId: string;
  rankLabel: RankLabel;
  prizeType: PrizeType;
  prizeValue: number;
  prizeDescription: string;
  winnerCount: number;
}

// ---------- Questions ----------
export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: OptionLetter;
  timeLimitSeconds: number;
  orderIndex: number;
}

// Client-safe version (no correct answer)
export interface QuestionForClient {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  timeLimitSeconds: number;
  orderIndex: number;
}

// ---------- Quiz Participation ----------
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface QuizParticipant {
  id: string;
  quizId: string;
  userId: string;
  paymentStatus: PaymentStatus;
  joinedAt: string;
  isRefunded: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  completedAt: string | null;
  totalCorrect: number;
  totalWrong: number;
  timeTakenSeconds: number;
  isEligible: boolean;
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOption: OptionLetter;
  isCorrect: boolean;
  answeredAt: string;
}

// ---------- Winners ----------
export interface Winner {
  id: string;
  quizId: string;
  userId: string;
  rankLabel: RankLabel;
  prizeType: PrizeType;
  prizeValue: number;
  announcedAt: string;
  isPaid: boolean;
  user?: Pick<User, 'id' | 'name' | 'avatar'>;
  quiz?: Pick<Quiz, 'id' | 'title' | 'category'>;
}

// ---------- Referral ----------
export type ReferralStatus = 'pending' | 'credited';

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  rewardAmount: number;
  status: ReferralStatus;
  createdAt: string;
}

// ---------- Admin ----------
export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

// ---------- API Response ----------
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---------- Auth ----------
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  isNewUser: boolean;
}

// ---------- Revenue ----------
export interface RevenueBreakdown {
  totalCollection: number;
  prizePool: number;
  platformRevenue: number;
  prizeDistribution: {
    rankLabel: RankLabel;
    amount: number;
    count: number;
  }[];
}

// ---------- Quiz Submit ----------
export interface QuizSubmission {
  quizId: string;
  answers: {
    questionId: string;
    selectedOption: OptionLetter;
  }[];
}

export interface QuizResult {
  attemptId: string;
  totalCorrect: number;
  totalWrong: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  isEligible: boolean;
  rank?: number;
}

// ---------- Payment ----------
export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentVerification {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
