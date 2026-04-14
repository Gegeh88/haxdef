export interface Domain {
  id: string;
  user_id: string;
  domain: string;
  verification_method: 'dns_txt' | 'html_file' | 'meta_tag' | null;
  verification_token: string;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: string;
  domain_id: string;
  user_id: string;
  scan_type: 'quick' | 'full';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_step: string | null;
  results_summary: Record<string, unknown> | null;
  results_detail: Record<string, unknown> | null;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  error_message: string | null;
}

export interface Report {
  id: string;
  scan_id: string;
  user_id: string;
  storage_path: string;
  file_size_bytes: number | null;
  executive_summary: string | null;
  technical_details: string | null;
  remediation_steps: Record<string, unknown>[] | null;
  gemini_model_used: string | null;
  generated_at: string;
}

export interface ScanQuota {
  user_id: string;
  daily_quick_scans: number;
  daily_full_scans: number;
  last_reset_date: string;
  max_daily_quick: number;
  max_daily_full: number;
}
