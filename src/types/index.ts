export type ProjectStatus = 'backlog' | 'in_progress' | 'completed' | 'maintenance' | '進行中' | '完了' | 'done';

export interface MaintenanceCost {
  id: string;
  project_id: string;
  name: string;
  monthly_fee: number;
  estimated_hours: number;
  actual_hours: number;
  created_at?: string;
}

export interface MaintenanceLog {
  id: string;
  project_id: string;
  cost_id: string;
  year_month: string; // "2025-01" format
  description: string;
  actual_hours: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  reward_amount: number;
  estimated_hours: number;
  total_tracked_seconds: number;
  status: ProjectStatus;
  frozen_hourly_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TimeEntry {
  id: string;
  project_id: string;
  user_id: string;
  start_time: string;
  duration_seconds: number;
  created_at?: string;
}
