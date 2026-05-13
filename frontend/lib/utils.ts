import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatRelativeDate(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: string | Date) {
  return isPast(new Date(date));
}

export const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

export const STATUS_COLORS: Record<string, string> = {
  TODO: 'status-todo',
  IN_PROGRESS: 'status-in-progress',
  IN_REVIEW: 'status-in-review',
  DONE: 'status-done',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'priority-low',
  MEDIUM: 'priority-medium',
  HIGH: 'priority-high',
  URGENT: 'priority-urgent',
};

export const PRIORITY_ICONS: Record<string, string> = {
  LOW: '↓',
  MEDIUM: '→',
  HIGH: '↑',
  URGENT: '⚡',
};

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
