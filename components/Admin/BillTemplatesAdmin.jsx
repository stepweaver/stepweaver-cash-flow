'use client';

import { useState } from 'react';
import {
  Trash2,
  Edit3,
  Plus,
  X,
  Eye,
  FileText,
  Info,
  Calendar,
  DollarSign,
} from 'lucide-react';

export default function BillTemplatesAdmin({
  billTemplates,
  onSaveTemplate,
  onDeleteTemplate,
  onUpdateTemplate,
  currentMonth,
  currentYear,
  monthNames,
}) {
  // Defensive programming - ensure props have safe defaults
  const safeBillTemplates = billTemplates || [];
  const safeCurrentYear =
    typeof currentYear === 'number' ? currentYear : new Date().getFullYear();

  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    amount: '',
    url: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Only require the template name
    if (!templateForm.name.trim()) {
      alert('Template name is required');
      return;
    }

    const templateData = {
      ...templateForm,
      amount: parseFloat(templateForm.amount) || 0,
    };

    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, templateData);
      setEditingTemplate(null);
    } else {
      onSaveTemplate(templateData);
    }

    setTemplateForm({
      name: '',
      amount: '',
      url: '',
    });
    setShowTemplateForm(false);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name || '',
      amount: template.amount?.toString() || '',
      url: template.url || '',
    });
    setShowTemplateForm(true);
  };

  const handleCancel = () => {
    setShowTemplateForm(false);
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      amount: '',
      url: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTemplateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
        <div className='px-4 sm:px-6 py-4 border-b border-terminal-border'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-terminal-purple font-ibm-custom mb-2'>
                Bill Templates Management
              </h3>
              <p className='text-sm text-terminal-muted font-ibm mb-2'>
                Create and manage bill templates. When bills are generated from
                templates, they will be created as blank entries for you to fill
                in.
              </p>
            </div>
            <button
              onClick={() => setShowTemplateForm(true)}
              className='flex items-center justify-center px-4 py-2 text-sm bg-terminal-green text-black rounded hover:bg-terminal-green/80 transition-colors font-ibm cursor-pointer w-full sm:w-auto'
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Template
            </button>
          </div>
        </div>
      </div>

      {/* Template Form Modal */}
      {showTemplateForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-terminal-light rounded-lg shadow-lg border border-terminal-border max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='px-6 py-4 border-b border-terminal-border bg-terminal-dark'>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='text-lg font-semibold text-terminal-text font-ibm'>
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h4>
                <button
                  onClick={handleCancel}
                  className='text-terminal-muted hover:text-terminal-text transition-colors p-1'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
                      Template Name *
                    </label>
                    <input
                      type='text'
                      name='name'
                      value={templateForm.name}
                      onChange={handleChange}
                      className='w-full px-3 py-2 bg-terminal-light border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-purple focus:border-transparent font-ibm text-sm'
                      placeholder='e.g., Rent, Utilities, Insurance'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
                      Amount
                    </label>
                    <input
                      type='number'
                      name='amount'
                      value={templateForm.amount}
                      onChange={handleChange}
                      step='0.01'
                      min='0'
                      className='w-full px-3 py-2 bg-terminal-light border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-purple focus:border-transparent font-ibm text-sm'
                      placeholder='0.00 (optional)'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
                      Payment URL
                    </label>
                    <input
                      type='url'
                      name='url'
                      value={templateForm.url}
                      onChange={handleChange}
                      className='w-full px-3 py-2 bg-terminal-light border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-purple focus:border-transparent font-ibm text-sm'
                      placeholder='https://example.com/payment'
                    />
                  </div>
                </div>
                <div className='flex justify-end space-x-3 pt-4'>
                  <button
                    type='button'
                    onClick={handleCancel}
                    className='px-4 py-2 text-terminal-muted hover:text-terminal-text border border-terminal-border rounded hover:border-terminal-muted hover:bg-terminal-dark/20 transition-all duration-200 font-ibm cursor-pointer text-sm'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-6 py-2 bg-terminal-purple text-white rounded hover:bg-terminal-purple/80 transition-colors font-ibm cursor-pointer text-sm'
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      {safeBillTemplates.length > 0 ? (
        <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
          <div className='px-6 py-4 border-b border-terminal-border'>
            <h4 className='text-md font-semibold text-terminal-text font-ibm mb-2'>
              Current Templates ({safeBillTemplates.length})
            </h4>
            <p className='text-sm text-terminal-muted font-ibm'>
              These templates will be used to generate blank bill entries each
              month.
            </p>
          </div>

          {/* Mobile Card View */}
          <div className='block md:hidden'>
            <div className='p-4 space-y-4'>
              {safeBillTemplates.map((template) => (
                <div
                  key={template.id}
                  className='bg-terminal-dark rounded-lg border border-terminal-border p-4 space-y-3'
                >
                  <div className='flex items-center justify-between'>
                    <h5 className='text-sm font-medium text-terminal-text font-ibm'>
                      {template.name}
                    </h5>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className='text-terminal-cyan hover:text-terminal-cyan/80 transition-colors cursor-pointer p-1'
                        title='Preview generated bill'
                      >
                        <Eye className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer p-1'
                        title='Edit template'
                        disabled={!template.id}
                      >
                        <Edit3 className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => onDeleteTemplate(template.id)}
                        className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer p-1'
                        title='Delete template'
                        disabled={!template.id}
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-terminal-muted font-ibm uppercase tracking-wider'>
                        Amount:
                      </span>
                      <span className='text-sm text-terminal-red font-ibm font-medium'>
                        ${template.amount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className='flex justify-between items-start'>
                      <span className='text-xs text-terminal-muted font-ibm uppercase tracking-wider'>
                        Payment URL:
                      </span>
                      <span className='text-sm text-terminal-text font-ibm text-right max-w-[200px] truncate'>
                        {template.url || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='min-w-full divide-y divide-terminal-border'>
              <thead className='bg-terminal-dark'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Template Name
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Amount
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Payment URL
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-terminal-light divide-y divide-terminal-border'>
                {safeBillTemplates.map((template) => (
                  <tr key={template.id} className='hover:bg-terminal-dark'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-terminal-text font-ibm'>
                      {template.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-red text-right font-ibm'>
                      ${template.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className='px-6 py-4 text-sm text-terminal-text font-ibm max-w-xs truncate'>
                      {template.url || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex justify-center space-x-2'>
                        <button
                          onClick={() => setSelectedTemplate(template)}
                          className='text-terminal-cyan hover:text-terminal-cyan/80 transition-colors cursor-pointer'
                          title='Preview generated bill'
                        >
                          <Eye className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => handleEdit(template)}
                          className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                          title='Edit template'
                          disabled={!template.id}
                        >
                          <Edit3 className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => onDeleteTemplate(template.id)}
                          className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                          title='Delete template'
                          disabled={!template.id}
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
          <div className='px-6 py-12 text-center'>
            <FileText className='h-12 w-12 text-terminal-muted mx-auto mb-4' />
            <p className='text-terminal-muted font-ibm mb-2'>
              No bill templates yet.
            </p>
            <p className='text-sm text-terminal-muted font-ibm'>
              Create your first template to automatically generate blank bill
              entries each month!
            </p>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-terminal-light rounded-lg shadow-lg border border-terminal-border max-w-md w-full'>
            <div className='px-6 py-4 border-b border-terminal-border'>
              <div className='flex items-center justify-between'>
                <h4 className='text-lg font-semibold text-terminal-text font-ibm'>
                  Template Preview
                </h4>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className='text-terminal-muted hover:text-terminal-text transition-colors'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>
            </div>
            <div className='px-6 py-4 space-y-4'>
              <div className='bg-terminal-dark p-4 rounded border border-terminal-border'>
                <h5 className='text-sm font-medium text-terminal-text font-ibm mb-3 flex items-center'>
                  <Info className='h-4 w-4 mr-2 text-terminal-cyan' />
                  When Generated, This Template Creates:
                </h5>
                <div className='space-y-3'>
                  <div className='flex items-center space-x-3'>
                    <FileText className='h-4 w-4 text-terminal-muted' />
                    <span className='text-sm text-terminal-text font-ibm'>
                      <strong>Name:</strong> {selectedTemplate.name}
                    </span>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <DollarSign className='h-4 w-4 text-terminal-muted' />
                    <span className='text-sm text-terminal-text font-ibm'>
                      <strong>Amount Due:</strong>{' '}
                      <span className='text-terminal-red'>$0.00</span> (blank -
                      you fill in)
                    </span>
                  </div>
                </div>
              </div>
              <div className='bg-terminal-green/10 border border-terminal-green/20 rounded p-3'>
                <p className='text-sm text-terminal-green font-ibm'>
                  <strong>Note:</strong> The generated bill will be completely
                  blank for you to fill in with actual amounts, due dates, and
                  notes. This template just provides the structure.
                </p>
              </div>
            </div>
            <div className='px-6 py-4 border-t border-terminal-border flex justify-end'>
              <button
                onClick={() => setSelectedTemplate(null)}
                className='px-4 py-2 bg-terminal-purple text-white rounded hover:bg-terminal-purple/80 transition-colors font-ibm cursor-pointer text-sm'
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
