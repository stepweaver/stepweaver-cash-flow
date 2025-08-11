'use client';

import PageLayout from '@/components/Layout/PageLayout';
import BusinessTracker from '@/components/BusinessTracker';

export default function StepweaverPage() {
  return (
    <PageLayout currentPage='stepweaver'>
      <BusinessTracker />
    </PageLayout>
  );
}
