import { describe, it, expect, vi } from 'vitest';
import { getInitials, formatDate, STATUS_LABELS, PRIORITY_LABELS, cn } from '../lib/utils';

describe('getInitials', () => {
  it('returns uppercase initials for two words', () => {
    expect(getInitials('Alice Johnson')).toBe('AJ');
  });

  it('returns single initial for one word', () => {
    expect(getInitials('Alice')).toBe('AL');
  });

  it('truncates to 2 characters max', () => {
    expect(getInitials('Alice Bob Carol')).toBe('AB');
  });
});

describe('cn (class merger)', () => {
  it('merges simple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const active = true;
    expect(cn('base', active && 'active')).toBe('base active');
  });

  it('deduplicates tailwind conflicts', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });
});

describe('STATUS_LABELS', () => {
  it('maps all four statuses', () => {
    expect(STATUS_LABELS['TODO']).toBe('To Do');
    expect(STATUS_LABELS['IN_PROGRESS']).toBe('In Progress');
    expect(STATUS_LABELS['IN_REVIEW']).toBe('In Review');
    expect(STATUS_LABELS['DONE']).toBe('Done');
  });
});

describe('PRIORITY_LABELS', () => {
  it('maps all four priorities', () => {
    expect(PRIORITY_LABELS['LOW']).toBe('Low');
    expect(PRIORITY_LABELS['MEDIUM']).toBe('Medium');
    expect(PRIORITY_LABELS['HIGH']).toBe('High');
    expect(PRIORITY_LABELS['URGENT']).toBe('Urgent');
  });
});

describe('formatDate', () => {
  it('formats a date string to readable format', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z');
    expect(result).toMatch(/Jan 15, 2024/);
  });
});
