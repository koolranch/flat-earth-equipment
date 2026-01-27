// Enterprise Bulk Operations - Phase 2
// CSV import/export and batch processing utilities

import { RoleType, normalizeRole } from './rbac';

/**
 * CSV User Record for import/export
 */
export interface CSVUserRecord {
  email: string;
  full_name: string;
  role?: string;
  department?: string;
  employee_id?: string;
  start_date?: string;
}

/**
 * CSV Training Assignment Record
 */
export interface CSVAssignmentRecord {
  email: string;
  course_slug: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  success: boolean;
  total: number;
  processed: number;
  failed: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
    data?: any;
  }>;
  created?: number;
  updated?: number;
  skipped?: number;
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV<T>(
  csvString: string,
  requiredFields: string[] = []
): { data: T[]; errors: string[] } {
  const lines = csvString.trim().split('\n');
  const errors: string[] = [];
  
  if (lines.length < 2) {
    return { data: [], errors: ['CSV must have a header row and at least one data row'] };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  
  // Validate required fields
  for (const field of requiredFields) {
    if (!headers.includes(field.toLowerCase())) {
      errors.push(`Missing required column: ${field}`);
    }
  }

  if (errors.length > 0) {
    return { data: [], errors };
  }

  // Parse data rows
  const data: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const record: Record<string, string> = {};

    headers.forEach((header, index) => {
      record[header] = values[index]?.trim() || '';
    });

    data.push(record as T);
  }

  return { data, errors };
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

/**
 * Generate CSV string from array of objects
 */
export function generateCSV<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return '';

  // Determine columns
  const cols = columns || Object.keys(data[0]).map(key => ({ key: key as keyof T, label: key }));
  
  // Generate header
  const headerRow = cols.map(c => escapeCSVValue(String(c.label))).join(',');
  
  // Generate data rows
  const dataRows = data.map(row => 
    cols.map(c => escapeCSVValue(String(row[c.key] ?? ''))).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape a value for CSV
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate user import record
 */
export function validateUserRecord(
  record: CSVUserRecord,
  rowIndex: number
): { valid: boolean; errors: Array<{ row: number; field: string; message: string }> } {
  const errors: Array<{ row: number; field: string; message: string }> = [];

  if (!record.email) {
    errors.push({ row: rowIndex, field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(record.email)) {
    errors.push({ row: rowIndex, field: 'email', message: 'Invalid email format' });
  }

  if (!record.full_name) {
    errors.push({ row: rowIndex, field: 'full_name', message: 'Full name is required' });
  }

  if (record.role) {
    const validRoles = ['viewer', 'member', 'manager', 'admin'];
    if (!validRoles.includes(record.role.toLowerCase())) {
      errors.push({ 
        row: rowIndex, 
        field: 'role', 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate training assignment record
 */
export function validateAssignmentRecord(
  record: CSVAssignmentRecord,
  rowIndex: number,
  validCourses: string[]
): { valid: boolean; errors: Array<{ row: number; field: string; message: string }> } {
  const errors: Array<{ row: number; field: string; message: string }> = [];

  if (!record.email) {
    errors.push({ row: rowIndex, field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(record.email)) {
    errors.push({ row: rowIndex, field: 'email', message: 'Invalid email format' });
  }

  if (!record.course_slug) {
    errors.push({ row: rowIndex, field: 'course_slug', message: 'Course is required' });
  } else if (validCourses.length > 0 && !validCourses.includes(record.course_slug)) {
    errors.push({ 
      row: rowIndex, 
      field: 'course_slug', 
      message: `Invalid course. Must be one of: ${validCourses.slice(0, 5).join(', ')}${validCourses.length > 5 ? '...' : ''}` 
    });
  }

  if (record.due_date) {
    const date = new Date(record.due_date);
    if (isNaN(date.getTime())) {
      errors.push({ row: rowIndex, field: 'due_date', message: 'Invalid date format. Use YYYY-MM-DD' });
    }
  }

  if (record.priority) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(record.priority.toLowerCase())) {
      errors.push({ 
        row: rowIndex, 
        field: 'priority', 
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generate sample CSV template for user import
 */
export function getUserImportTemplate(): string {
  const sampleData: CSVUserRecord[] = [
    {
      email: 'john.doe@company.com',
      full_name: 'John Doe',
      role: 'member',
      department: 'Operations',
      employee_id: 'EMP001',
      start_date: '2024-01-15'
    },
    {
      email: 'jane.smith@company.com',
      full_name: 'Jane Smith',
      role: 'manager',
      department: 'Safety',
      employee_id: 'EMP002',
      start_date: '2024-02-01'
    }
  ];

  return generateCSV(sampleData, [
    { key: 'email', label: 'Email' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' },
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'start_date', label: 'Start Date' }
  ]);
}

/**
 * Generate sample CSV template for training assignments
 */
export function getAssignmentTemplate(): string {
  const sampleData: CSVAssignmentRecord[] = [
    {
      email: 'john.doe@company.com',
      course_slug: 'forklift-certification',
      due_date: '2024-03-01',
      priority: 'high',
      notes: 'Required for warehouse access'
    },
    {
      email: 'jane.smith@company.com',
      course_slug: 'forklift-certification',
      due_date: '2024-03-15',
      priority: 'medium',
      notes: ''
    }
  ];

  return generateCSV(sampleData, [
    { key: 'email', label: 'Email' },
    { key: 'course_slug', label: 'Course Slug' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'priority', label: 'Priority' },
    { key: 'notes', label: 'Notes' }
  ]);
}

/**
 * Export users to CSV
 */
export function exportUsersToCSV(users: Array<{
  email: string;
  full_name: string;
  role: string;
  department?: string;
  enrollment_count?: number;
  completion_rate?: number;
  last_active?: string;
}>): string {
  return generateCSV(users, [
    { key: 'email', label: 'Email' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' },
    { key: 'enrollment_count', label: 'Enrollments' },
    { key: 'completion_rate', label: 'Completion Rate %' },
    { key: 'last_active', label: 'Last Active' }
  ]);
}

/**
 * Export enrollments to CSV
 */
export function exportEnrollmentsToCSV(enrollments: Array<{
  user_email: string;
  user_name: string;
  course_name: string;
  progress_pct: number;
  passed: boolean;
  score?: number;
  enrolled_at: string;
  completed_at?: string;
}>): string {
  return generateCSV(enrollments, [
    { key: 'user_email', label: 'Email' },
    { key: 'user_name', label: 'Name' },
    { key: 'course_name', label: 'Course' },
    { key: 'progress_pct', label: 'Progress %' },
    { key: 'passed', label: 'Passed' },
    { key: 'score', label: 'Score' },
    { key: 'enrolled_at', label: 'Enrolled Date' },
    { key: 'completed_at', label: 'Completed Date' }
  ]);
}
