export interface Setting {
  id?: string;
  key: string;
  value: string;
  description?: string;
  source?: string;
  data_type?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CreateSettingRequest {
  source?: string;
  key: string;
  value: string;
  data_type?: string;
  description?: string;
}

export interface UpdateSettingRequest {
  source?: string;
  key?: string;
  value?: string;
  data_type?: string;
  description?: string;
}