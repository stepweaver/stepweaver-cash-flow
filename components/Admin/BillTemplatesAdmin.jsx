'use client';

import { useState } from 'react';
import { Trash2, Edit3, Plus, X } from 'lucide-react';

export default function BillTemplatesAdmin({
  billTemplates,
  onSaveTemplate,
  onDeleteTemplate,
  onUpdateTemplate,
  currentMonth,
  currentYear,
  monthNames,
}) {
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    amount: '',
    dueDay: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const templateData = {
      ...templateForm,
      amount: parseFloat(templateForm.amount) || 0,
      dueDay: parseInt(templateForm.dueDay) || 1,
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
      dueDay: '',
      notes: '',
    });
    setShowTemplateForm(false);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name || '',
      amount: template.amount?.toString() || '',
      dueDay: template.dueDay?.toString() || '',
      notes: template.notes || '',
    });
    setShowTemplateForm(true);
  };

  const handleCancel = () => {
    setShowTemplateForm(false);
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      amount: '',
      dueDay: '',
      notes: '',
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
    <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden mb-8'>
      <div className='px-6 py-4 border-b border-terminal-border'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-terminal-purple font-ibm-custom'>
            Bill Templates Management
          </h3>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setShowTemplateForm(true)}
              className='flex items-center px-3 py-1 text-sm bg-terminal-green text-black rounded hover:bg-terminal-green/80 transition-colors font-ibm cursor-pointer'
            >
              <Plus className='h-3 w-3 mr-1 lucide' />
              Add Template
            </button>
          </div>
        </div>
      </div>

      {/* Template Form */}
      {showTemplateForm && (
        <div className='px-6 py-4 border-b border-terminal-border bg-terminal-dark'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
                  Name
                </label>
                <input
                  type='text'
                  name='name'
                  value={templateForm.name}
                  onChange={handleChange}
                  className='w-full px-3 py-2 bg-terminal-light border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-purple focus:border-transparent font-ibm text-sm'
                  placeholder='e.g., Rent'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
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
                  placeholder='0.00'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
                  Due Day
                </label>
                <input
                  type='number'
                  name='dueDay'
                  value={templateForm.dueDay}
                  onChange={handleChange}
                  min='1'
                  max='31'
                  className='w-full px-3 py-2 bg-terminal-light border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-purple focus:border-transparent font-ibm text-sm'
                  placeholder='1-31'
                  required
                />
              </div>
              <div className='flex items-end space-x-2'>
                <div className='flex-1'>
                  <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
                    Notes
                  </label>
                  <input
                    type='text'
                    name='notes'
                    value={templateForm.notes}
                    onChange={handleChange}
                    className='w-full px-3 py-2 bg-terminal-light border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-purple focus:border-transparent font-ibm text-sm'
                    placeholder='Optional'
                  />
                </div>
                <button
                  type='submit'
                  className='px-4 py-2 bg-terminal-purple text-white rounded hover:bg-terminal-purple/80 transition-colors font-ibm cursor-pointer text-sm'
                >
                  {editingTemplate ? 'Update' : 'Save'}
                </button>
                <button
                  type='button'
                  onClick={handleCancel}
                  className='px-4 py-2 text-terminal-muted hover:text-terminal-text border border-terminal-border rounded hover:border-terminal-muted hover:bg-terminal-dark/20 transition-all duration-200 font-ibm cursor-pointer text-sm'
                >
                  <X className='h-4 w-4 lucide' />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      {billTemplates.length > 0 ? (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-terminal-border'>
            <thead className='bg-terminal-dark'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                  Template Name
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                  Amount
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                  Due Day
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                  Notes
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-terminal-light divide-y divide-terminal-border'>
              {billTemplates.map((template) => (
                <tr key={template.id} className='hover:bg-terminal-dark'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-terminal-text font-ibm'>
                    {template.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-red text-right font-ibm'>
                    ${template.amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text text-center font-ibm'>
                    {template.dueDay}
                  </td>
                  <td className='px-6 py-4 text-sm text-terminal-text font-ibm'>
                    {template.notes}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <div className='flex justify-center space-x-2'>
                      <button
                        onClick={() => handleEdit(template)}
                        className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                        title='Edit template'
                      >
                        <Edit3 className='h-4 w-4 lucide' />
                      </button>
                      <button
                        onClick={() => onDeleteTemplate(template.id)}
                        className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                        title='Delete template'
                      >
                        <Trash2 className='h-4 w-4 lucide' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='px-6 py-12 text-center'>
          <p className='text-terminal-muted font-ibm'>
            No bill templates yet. Create one to automatically generate bills
            each month!
          </p>
        </div>
      )}
    </div>
  );
}
