/**
 * Weighted Lucky Draw Algorithm
 *
 * Users who complete the quiz faster get higher weight in the draw.
 * This is not purely random – speed matters, but luck still plays a role.
 *
 * Weight formula: maxTime - timeTaken + 1 (so faster = higher weight)
 */

interface Participant {
  userId: string;
  timeTakenSeconds: number;
}

interface DrawResult {
  userId: string;
  weight: number;
}

/**
 * Perform a weighted random selection from eligible participants.
 * @param participants - List of eligible participants with their completion times
 * @param count - Number of winners to select
 * @returns Selected winners in order (first selected = highest rank)
 */
export function weightedLuckyDraw(
  participants: Participant[],
  count: number
): DrawResult[] {
  if (participants.length === 0) return [];
  if (count >= participants.length) {
    // Everyone wins
    return participants.map((p) => ({
      userId: p.userId,
      weight: 1,
    }));
  }

  // Calculate max time for weight normalization
  const maxTime = Math.max(...participants.map((p) => p.timeTakenSeconds));

  // Assign weights: faster completion = higher weight
  const weighted = participants.map((p) => ({
    userId: p.userId,
    timeTakenSeconds: p.timeTakenSeconds,
    weight: maxTime - p.timeTakenSeconds + 1,
  }));

  const winners: DrawResult[] = [];
  const remaining = [...weighted];

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;

    for (let j = 0; j < remaining.length; j++) {
      random -= remaining[j].weight;
      if (random <= 0) {
        winners.push({
          userId: remaining[j].userId,
          weight: remaining[j].weight,
        });
        remaining.splice(j, 1);
        break;
      }
    }
  }

  return winners;
}

/**
 * Calculate revenue breakdown for a quiz
 */
export function calculateRevenue(
  entryFee: number,
  participants: number,
  prizePoolPercentage: number
) {
  const totalCollection = entryFee * participants;
  const prizePool = Math.floor(totalCollection * (prizePoolPercentage / 100));
  const platformRevenue = totalCollection - prizePool;

  return {
    totalCollection,
    prizePool,
    platformRevenue,
  };
}

/**
 * Generate a unique referral code
 */
export function generateReferralCode(name?: string): string {
  const prefix = name
    ? name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()
    : 'MNSH';
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${random}`;
}

/**
 * Generate a 6-digit OTP
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
