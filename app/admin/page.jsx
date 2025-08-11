'use client';

import UserManagement from '@/components/Admin/UserManagement.jsx';
import BillTemplatesAdmin from '@/components/Admin/BillTemplatesAdmin.jsx';
import PageLayout from '@/components/Layout/PageLayout';
import { usePersonalTracker } from '@/hooks/usePersonalTracker';

export default function AdminPage() {
  const {
    billTemplates,
    handleSaveTemplate,
    handleDeleteTemplate,
    handleUpdateTemplate,
    currentMonth,
    currentYear,
    monthNames,
  } = usePersonalTracker();

  return (
    <PageLayout currentPage='admin'>
      <BillTemplatesAdmin
        billTemplates={billTemplates}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onUpdateTemplate={handleUpdateTemplate}
        currentMonth={currentMonth}
        currentYear={currentYear}
        monthNames={monthNames}
      />
      <UserManagement />
    </PageLayout>
  );
}
