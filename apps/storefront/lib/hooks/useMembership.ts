'use client';

import { useState, useEffect } from 'react';
import { membershipService } from '@/lib/services/membership/membership-service';
import type { Membership } from '@/lib/types';

export function useMembership() {
  const [membership, setMembership] = useState<Membership>({ isMember: false });
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize membership from localStorage after mount
  useEffect(() => {
    setMounted(true);
    setMembership(membershipService.getMembership());
  }, []);

  // Sync with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setMembership(membershipService.getMembership());
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const enrollMembership = async () => {
    setIsEnrolling(true);

    try {
      // Simulate async enrollment (e.g., API call) with a short delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newMembership = membershipService.enrollMembership();
      setMembership(newMembership);
    } catch (error) {
      console.error('Failed to enroll in membership:', error);
      throw error;
    } finally {
      setIsEnrolling(false);
    }
  };

  return {
    membership,
    isMember: mounted ? membership.isMember : false,
    isEnrolling,
    enrollMembership,
    mounted,
  };
}
