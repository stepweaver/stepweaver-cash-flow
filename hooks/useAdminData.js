import { useState, useEffect, useCallback } from 'react';
import { useTokenManager } from '@/lib/client-token-manager';
import { useAuth } from '@/lib/authContext';

export function useAdminData() {
  const [billTemplates, setBillTemplates] = useState([]);
  const { user } = useAuth();
  const tokenManager = useTokenManager();

  // Load bill templates when user changes
  const loadTemplates = useCallback(async () => {
    if (!user) return;

    try {
      const templatesResponse = await tokenManager.getBillTemplates();
      setBillTemplates(templatesResponse.templates || []);
    } catch (error) {
      console.error('Error loading bill templates:', error);
      setBillTemplates([]);
    }
  }, [user, tokenManager]);

  useEffect(() => {
    if (!user) return;
    loadTemplates();
  }, [user?.uid, loadTemplates]);

  const handleSaveTemplate = useCallback(async (templateData) => {
    try {
      const newTemplate = await tokenManager.createBillTemplate(templateData);
      setBillTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }, [tokenManager]);

  const handleUpdateTemplate = useCallback(async (templateId, templateData) => {
    try {
      const updatedTemplate = await tokenManager.updateBillTemplate(templateId, templateData);
      setBillTemplates(prev =>
        prev.map(t => t.id === templateId ? updatedTemplate : t)
      );
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }, [tokenManager]);

  const handleDeleteTemplate = useCallback(async (templateId) => {
    try {
      await tokenManager.deleteBillTemplate(templateId);
      setBillTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }, [tokenManager]);

  return {
    billTemplates,
    handleSaveTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    loadTemplates
  };
}
