'use client';

import UserManagement from '@/components/Admin/UserManagement.jsx';
import BillTemplatesAdmin from '@/components/Admin/BillTemplatesAdmin.jsx';
import PageLayout from '@/components/Layout/PageLayout';
import { useAdminData } from '@/hooks/useAdminData';
import { getMonthNames } from '@/lib/utils';

export default function AdminPage() {
  const {
    billTemplates,
    handleSaveTemplate,
    handleDeleteTemplate,
    handleUpdateTemplate,
  } = useAdminData();

  return (
    <PageLayout currentPage='admin'>
      <BillTemplatesAdmin
        billTemplates={billTemplates}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onUpdateTemplate={handleUpdateTemplate}
        currentMonth={new Date().getMonth() + 1}
        currentYear={new Date().getFullYear()}
        monthNames={getMonthNames()}
      />
      <UserManagement />
    </PageLayout>
  );
}
