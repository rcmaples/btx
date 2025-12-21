import type { Membership, MembershipService } from '@/lib/types';

const MEMBERSHIP_STORAGE_KEY = 'bt_membership';

class MembershipServiceImpl implements MembershipService {
  /**
   * Get current membership status from local storage
   */
  getMembership(): Membership {
    if (typeof window === 'undefined') {
      return { isMember: false };
    }

    const stored = localStorage.getItem(MEMBERSHIP_STORAGE_KEY);

    if (!stored) {
      return { isMember: false };
    }

    try {
      const parsed = JSON.parse(stored) as Membership;
      return {
        isMember: parsed.isMember,
        enrolledAt: parsed.enrolledAt ? new Date(parsed.enrolledAt) : undefined,
      };
    } catch (error) {
      console.error('Failed to parse membership data:', error);
      return { isMember: false };
    }
  }

  /**
   * Enroll in Exchange membership
   * Sets session flag (no persistent user records per Assumption 3)
   */
  enrollMembership(): Membership {
    const membership: Membership = {
      isMember: true,
      enrolledAt: new Date(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(membership));
    }

    return membership;
  }

  /**
   * Check if user is member
   */
  isMember(): boolean {
    return this.getMembership().isMember;
  }
}

export const membershipService = new MembershipServiceImpl();
