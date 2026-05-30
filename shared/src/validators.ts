import { z } from 'zod';

// ============================================================
// Monish – Shared Zod Validators
// ============================================================

// ---------- Auth ----------
export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
    .transform((v) => v.trim()),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  deviceId: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ---------- User ----------
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  referralCode: z.string().min(4).max(12).optional(),
});

// ---------- Wallet ----------
export const addMoneySchema = z.object({
  amount: z.number().int().min(10, 'Minimum ₹10').max(50000, 'Maximum ₹50,000'),
});

export const withdrawSchema = z.object({
  amount: z.number().int().min(100, 'Minimum withdrawal ₹100').max(50000, 'Maximum ₹50,000'),
  upiId: z.string().regex(/^[\w.-]+@[\w]+$/, 'Invalid UPI ID'),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

// ---------- Quiz ----------
export const createQuizSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  category: z.enum([
    'general', 'science', 'technology', 'sports',
    'entertainment', 'history', 'geography',
    'current_affairs', 'bollywood', 'cricket',
  ]),
  entryFee: z.number().int().min(5).max(10000),
  minParticipants: z.number().int().min(2).max(10000),
  maxParticipants: z.number().int().min(2).max(10000),
  prizePoolPercentage: z.number().min(30).max(40),
  startTime: z.string().datetime(),
  durationSeconds: z.number().int().min(60).max(3600),
  prizeStructure: z.array(z.object({
    rankLabel: z.enum(['bumper', '1st', '2nd', '3rd', 'consolation']),
    prizeType: z.enum(['cash', 'gift', 'wallet_credit']),
    prizeValue: z.number().min(0),
    prizeDescription: z.string().min(1).max(200),
    winnerCount: z.number().int().min(1),
  })).min(1),
  questions: z.array(z.object({
    questionText: z.string().min(5).max(500),
    optionA: z.string().min(1).max(200),
    optionB: z.string().min(1).max(200),
    optionC: z.string().min(1).max(200),
    optionD: z.string().min(1).max(200),
    correctOption: z.enum(['A', 'B', 'C', 'D']),
    timeLimitSeconds: z.number().int().min(5).max(120).default(15),
    orderIndex: z.number().int().min(0),
  })).min(1).max(20),
}).refine(
  (data) => data.maxParticipants >= data.minParticipants,
  { message: 'maxParticipants must be >= minParticipants', path: ['maxParticipants'] }
);

export const quizFiltersSchema = z.object({
  category: z.string().optional(),
  status: z.enum(['upcoming', 'filling', 'active', 'completed', 'cancelled']).optional(),
  minFee: z.coerce.number().optional(),
  maxFee: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const submitAnswersSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    selectedOption: z.enum(['A', 'B', 'C', 'D']),
  })).min(1),
});

// ---------- Admin ----------
export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const blockUserSchema = z.object({
  isBlocked: z.boolean(),
  reason: z.string().min(3).max(200).optional(),
});

export const approveWithdrawalSchema = z.object({
  approved: z.boolean(),
  remarks: z.string().max(200).optional(),
});

// ---------- Pagination ----------
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Export inferred types
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddMoneyInput = z.infer<typeof addMoneySchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type QuizFiltersInput = z.infer<typeof quizFiltersSchema>;
export type SubmitAnswersInput = z.infer<typeof submitAnswersSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
