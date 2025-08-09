import JSZip from 'jszip';
import { formatCurrency, formatDate, formatDateForDisplay } from './utils';

// Export transactions to CSV format
export const exportToCSV = (transactions, filename = 'transactions.csv') => {
  const headers = ['Date', 'Type', 'Description', 'Amount', 'Receipts'];

  const csvContent = [
    headers.join(','),
    ...transactions.map(transaction => [
      formatDate(transaction.date),
      transaction.type || 'N/A',
      `"${(transaction.description || '').replace(/"/g, '""')}"`,
      transaction.amount || 0,
      transaction.receipts ? transaction.receipts.length : 0
    ].join(','))
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

// Export transactions to JSON format
export const exportToJSON = (transactions, filename = 'transactions.json') => {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalTransactions: transactions.length,
    transactions: transactions.map(transaction => ({
      id: transaction.id,
      date: formatDate(transaction.date),
      type: transaction.type || 'N/A',
      description: transaction.description || '',
      amount: transaction.amount || 0,
      receipts: transaction.receipts ? transaction.receipts.map(receipt => ({
        id: receipt.id,
        name: receipt.name,
        url: receipt.url,
        type: receipt.type,
        size: receipt.size
      })) : []
    }))
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

// Generate PDF/HTML content for transactions
export const generatePDFHTML = (transactions, title = 'Transaction Report') => {
  const totalRevenue = transactions
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalDraws = transactions
    .filter(t => t.type === 'draw')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netIncome = totalRevenue - totalExpenses - totalDraws;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            margin: 40px;
            color: #00ff00;
            background-color: #000;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #00ff00;
            padding-bottom: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 14px;
            color: #888;
        }
        .summary {
            margin-bottom: 40px;
            padding: 20px;
            border: 1px solid #333;
            background-color: #111;
        }
        .summary h2 {
            color: #00ff00;
            margin-top: 0;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        .summary-item {
            padding: 10px;
            border-left: 3px solid;
        }
        .revenue { border-left-color: #00ff00; }
        .expense { border-left-color: #ff0000; }
        .draw { border-left-color: #ffff00; }
        .net-income { border-left-color: #ff00ff; }
        .summary-label {
            font-size: 12px;
            color: #888;
        }
        .summary-value {
            font-size: 18px;
            font-weight: bold;
            margin-top: 5px;
        }
        .transactions {
            margin-top: 40px;
        }
        .transactions h2 {
            color: #00ff00;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #333;
        }
        th {
            background-color: #222;
            color: #00ff00;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #111;
        }
        .type-revenue { color: #00ff00; }
        .type-expense { color: #ff0000; }
        .type-draw { color: #ffff00; }
        .amount {
            text-align: right;
        }
        .receipts {
            text-align: center;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #333;
            text-align: center;
            color: #888;
            font-size: 12px;
        }
        @media print {
            body { 
                background-color: white; 
                color: black; 
            }
            .type-revenue { color: #006600; }
            .type-expense { color: #cc0000; }
            .type-draw { color: #cc6600; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${title}</div>
        <div class="subtitle">Generated on ${formatDateForDisplay(new Date())}</div>
        <div class="subtitle">Total Transactions: ${transactions.length}</div>
    </div>

    <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
            <div class="summary-item revenue">
                <div class="summary-label">TOTAL REVENUE</div>
                <div class="summary-value">${formatCurrency(totalRevenue)}</div>
            </div>
            <div class="summary-item expense">
                <div class="summary-label">TOTAL EXPENSES</div>
                <div class="summary-value">${formatCurrency(totalExpenses)}</div>
            </div>
            <div class="summary-item draw">
                <div class="summary-label">TOTAL DRAWS</div>
                <div class="summary-value">${formatCurrency(totalDraws)}</div>
            </div>
            <div class="summary-item net-income">
                <div class="summary-label">NET INCOME</div>
                <div class="summary-value">${formatCurrency(netIncome)}</div>
            </div>
        </div>
    </div>

    <div class="transactions">
        <h2>Transaction Details</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Receipts</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.map(transaction => `
                    <tr>
                        <td>${formatDate(transaction.date)}</td>
                        <td class="type-${transaction.type || 'unknown'}">${(transaction.type || 'N/A').toUpperCase()}</td>
                        <td>${transaction.description || 'N/A'}</td>
                        <td class="amount">${formatCurrency(transaction.amount || 0)}</td>
                        <td class="receipts">${transaction.receipts ? transaction.receipts.length : 0}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        This report was generated by StepWeaver Cash Flow Tracker<br>
        For questions or support, please contact your system administrator.
    </div>
</body>
</html>`;

  return html;
};

// Download receipts as ZIP file with links (workaround for CORS issues)
export const downloadReceiptsAsZip = async (transactions, filename = 'receipts.zip') => {
  const zip = new JSZip();

  // Create an index file with all receipt information
  let indexContent = `RECEIPT ARCHIVE INDEX
Generated: ${new Date().toLocaleString()}
Total Transactions with Receipts: ${transactions.filter(t => t.receipts && t.receipts.length > 0).length}

INSTRUCTIONS:
This ZIP file contains receipt download links and information due to browser security restrictions.
To access the actual receipt files:
1. Open the individual .txt files below
2. Copy the download URL from each file
3. Paste the URL in your browser to download the receipt
4. Or click the links if your system supports it

RECEIPT FILES BY TRANSACTION:
=====================================

`;

  let receiptIndex = 1;

  for (const transaction of transactions) {
    if (transaction.receipts && transaction.receipts.length > 0) {
      indexContent += `Transaction: ${transaction.description || 'N/A'}
Date: ${formatDate(transaction.date)}
Amount: ${formatCurrency(transaction.amount || 0)}
Receipts: ${transaction.receipts.length}

`;

      for (const receipt of transaction.receipts) {
        const receiptFileName = `receipt_${receiptIndex.toString().padStart(3, '0')}_${(receipt.name || 'unknown').replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const receiptInfo = `RECEIPT DOWNLOAD INFORMATION
============================

Transaction: ${transaction.description || 'N/A'}
Date: ${formatDate(transaction.date)}
Amount: ${formatCurrency(transaction.amount || 0)}

Receipt Details:
- Name: ${receipt.name || 'Unknown'}
- Type: ${receipt.type || 'Unknown'}
- Size: ${receipt.size ? `${(receipt.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
- Upload Date: ${receipt.uploadDate || 'Unknown'}

DOWNLOAD URL:
${receipt.url}

INSTRUCTIONS:
1. Copy the URL above
2. Paste it in your browser address bar
3. Press Enter to download the receipt
4. Or try clicking the link if your system supports it

Note: Due to browser security restrictions, we cannot include the actual
file content in this ZIP. The URL above provides direct access to your
receipt file stored in Firebase Storage.
`;

        zip.file(`${receiptFileName}.txt`, receiptInfo);

        indexContent += `  - ${receiptFileName}.txt (${receipt.name || 'Unknown'})\n`;
        receiptIndex++;
      }

      indexContent += '\n';
    }
  }

  // Add the index file
  zip.file('README_RECEIPT_INDEX.txt', indexContent);

  // Add a summary file
  const summaryContent = `RECEIPT ARCHIVE SUMMARY
=====================

This ZIP file contains ${receiptIndex - 1} receipt download links.

Due to browser security restrictions (CORS policy), we cannot directly
embed the receipt files in this ZIP archive. Instead, this archive
contains:

1. README_RECEIPT_INDEX.txt - Complete index of all receipts
2. Individual .txt files - Each contains download information for one receipt

To access your receipts:
- Open any .txt file
- Copy the download URL
- Paste in browser to download the actual receipt file

Your receipts are safely stored in Firebase Storage and accessible
via the URLs provided in each .txt file.

Generated: ${new Date().toLocaleString()}
Total Receipt Files: ${receiptIndex - 1}
`;

  zip.file('RECEIPT_SUMMARY.txt', summaryContent);

  try {
    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile(content, filename, 'application/zip');

    return {
      success: true,
      message: `ZIP file created with ${receiptIndex - 1} receipt download links`
    };
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    throw new Error('Failed to create ZIP file');
  }
};

// Helper function to download files
export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
