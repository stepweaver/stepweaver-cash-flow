'use client';

import PageLayout from '@/components/Layout/PageLayout';
import PersonalTracker from '@/components/PersonalTracker';

export default function PersonalPage() {
  return (
    <PageLayout currentPage='personal'>
      <PersonalTracker />
    </PageLayout>
  );
}
