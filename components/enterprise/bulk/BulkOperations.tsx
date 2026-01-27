'use client';

import React, { useState, useRef } from 'react';
import {
  EnterpriseCard,
  EnterpriseH2,
  EnterpriseH3,
  EnterpriseBody,
  EnterpriseBodySmall,
  EnterpriseButton
} from '../ui/DesignSystem';
import { Can } from '../auth/RoleGuard';

interface BulkOperationResult {
  success: boolean;
  total: number;
  processed: number;
  failed: number;
  errors: Array<{ row: number; field?: string; message: string }>;
  created?: number;
  updated?: number;
  skipped?: number;
}

interface BulkImportProps {
  type: 'users' | 'assignments';
  orgId: string;
  onComplete?: (result: BulkOperationResult) => void;
}

/**
 * Bulk Import Component with file upload and preview
 */
export function BulkImport({ type, orgId, onComplete }: BulkImportProps) {
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [preview, setPreview] = useState<string[][]>([]);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<BulkOperationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      
      // Generate preview (first 5 rows)
      const lines = content.trim().split('\n').slice(0, 6);
      const previewData = lines.map(line => 
        line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );
      setPreview(previewData);
      setResult(null);
    };
    
    reader.readAsText(file);
  };

  const handleValidate = async () => {
    if (!csvContent) return;
    
    setValidating(true);
    try {
      const response = await fetch('/api/enterprise/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          csv_content: csvContent,
          org_id: orgId,
          dry_run: true
        })
      });

      const data = await response.json();
      if (data.result) {
        setResult(data.result);
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!csvContent) return;
    
    setImporting(true);
    try {
      const response = await fetch('/api/enterprise/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          csv_content: csvContent,
          org_id: orgId,
          dry_run: false
        })
      });

      const data = await response.json();
      if (data.result) {
        setResult(data.result);
        onComplete?.(data.result);
      }
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    window.open(`/api/enterprise/bulk?action=template&type=${type}`, '_blank');
  };

  const clearFile = () => {
    setCsvContent('');
    setFileName('');
    setPreview([]);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <EnterpriseCard>
      <EnterpriseH3 className="mb-4">
        {type === 'users' ? 'Import Users' : 'Bulk Assign Training'}
      </EnterpriseH3>

      {/* Template Download */}
      <div className="mb-4 p-3 bg-info-50 border border-info-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <EnterpriseBodySmall className="font-medium text-info-800">
              Download Template
            </EnterpriseBodySmall>
            <EnterpriseBodySmall className="text-info-600">
              Use our CSV template for the correct format
            </EnterpriseBodySmall>
          </div>
          <EnterpriseButton variant="outline" size="sm" onClick={downloadTemplate}>
            📥 Template
          </EnterpriseButton>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {!fileName ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-8 border-2 border-dashed border-neutral-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <EnterpriseBody className="font-medium">
                Click to upload CSV file
              </EnterpriseBody>
              <EnterpriseBodySmall className="text-neutral-500">
                or drag and drop
              </EnterpriseBodySmall>
            </div>
          </button>
        ) : (
          <div className="p-4 bg-neutral-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <div className="font-medium text-neutral-900">{fileName}</div>
                <div className="text-sm text-neutral-500">
                  {preview.length - 1} rows detected
                </div>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="text-neutral-500 hover:text-danger-600"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="mb-4 overflow-x-auto">
          <EnterpriseBodySmall className="font-medium mb-2">Preview</EnterpriseBodySmall>
          <table className="w-full text-sm border border-neutral-200 rounded-lg overflow-hidden">
            <thead className="bg-neutral-100">
              <tr>
                {preview[0]?.map((header, i) => (
                  <th key={i} className="px-3 py-2 text-left font-medium text-neutral-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-neutral-200">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 text-neutral-600">
                      {cell || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {preview.length > 5 && (
            <EnterpriseBodySmall className="mt-2 text-neutral-500">
              Showing first 5 rows...
            </EnterpriseBodySmall>
          )}
        </div>
      )}

      {/* Validation Results */}
      {result && (
        <div className={`mb-4 p-4 rounded-lg ${
          result.success ? 'bg-success-50 border border-success-200' : 'bg-warning-50 border border-warning-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{result.success ? '✅' : '⚠️'}</span>
            <EnterpriseBody className={`font-medium ${result.success ? 'text-success-800' : 'text-warning-800'}`}>
              {result.success ? 'Validation Passed' : 'Validation Issues Found'}
            </EnterpriseBody>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
            <div>
              <div className="text-neutral-500">Total</div>
              <div className="font-medium">{result.total}</div>
            </div>
            <div>
              <div className="text-success-600">Created</div>
              <div className="font-medium">{result.created || 0}</div>
            </div>
            <div>
              <div className="text-info-600">Updated</div>
              <div className="font-medium">{result.updated || 0}</div>
            </div>
            <div>
              <div className="text-warning-600">Skipped</div>
              <div className="font-medium">{result.skipped || 0}</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <EnterpriseBodySmall className="font-medium text-danger-700 mb-2">
                Errors ({result.errors.length})
              </EnterpriseBodySmall>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {result.errors.slice(0, 10).map((error, i) => (
                  <div key={i} className="text-sm text-danger-600">
                    Row {error.row}: {error.message}
                  </div>
                ))}
                {result.errors.length > 10 && (
                  <div className="text-sm text-neutral-500">
                    +{result.errors.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {csvContent && (
        <div className="flex gap-3">
          <EnterpriseButton
            variant="secondary"
            onClick={handleValidate}
            loading={validating}
            disabled={importing}
          >
            🔍 Validate
          </EnterpriseButton>
          
          <EnterpriseButton
            variant="primary"
            onClick={handleImport}
            loading={importing}
            disabled={validating || (result !== null && !result.success)}
          >
            📤 Import
          </EnterpriseButton>
        </div>
      )}
    </EnterpriseCard>
  );
}

/**
 * Bulk Export Component
 */
interface BulkExportProps {
  orgId: string;
}

export function BulkExport({ orgId }: BulkExportProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: 'users' | 'enrollments') => {
    setExporting(type);
    try {
      window.open(`/api/enterprise/bulk?action=export&type=${type}&org_id=${orgId}`, '_blank');
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  };

  return (
    <EnterpriseCard>
      <EnterpriseH3 className="mb-4">Export Data</EnterpriseH3>
      
      <div className="space-y-3">
        <ExportOption
          title="Export Users"
          description="Download all organization users with their roles and completion stats"
          icon="👥"
          loading={exporting === 'users'}
          onClick={() => handleExport('users')}
        />
        
        <ExportOption
          title="Export Enrollments"
          description="Download all training enrollments with progress and scores"
          icon="📚"
          loading={exporting === 'enrollments'}
          onClick={() => handleExport('enrollments')}
        />
      </div>
    </EnterpriseCard>
  );
}

function ExportOption({
  title,
  description,
  icon,
  loading,
  onClick
}: {
  title: string;
  description: string;
  icon: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full p-4 border border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left flex items-center gap-4 disabled:opacity-50"
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <div className="font-medium text-neutral-900">{title}</div>
        <div className="text-sm text-neutral-500">{description}</div>
      </div>
      {loading ? (
        <div className="animate-spin">⏳</div>
      ) : (
        <span className="text-primary-500">📥</span>
      )}
    </button>
  );
}
