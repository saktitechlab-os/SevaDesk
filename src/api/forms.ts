import { invoke } from '@tauri-apps/api/core';

export interface Form {
  id: string;
  name: string;
  category: string;
  state: string;
  district: string;
  description: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

export async function get_forms(): Promise<Form[]> {
  return await invoke('get_forms');
}

export async function add_form(form: Omit<Form, 'id' | 'created_at'>): Promise<Form> {
  return await invoke('add_form', form);
}

export async function delete_form(id: string): Promise<void> {
  return await invoke('delete_form', { id });
}

export async function search_forms(query: string, category?: string): Promise<Form[]> {
  return await invoke('search_forms', { query, category });
}

export async function export_form(form_id: string, dest_path: string): Promise<void> {
  return await invoke('export_form', { form_id, dest_path });
}

export async function read_form_file(form_id: string): Promise<number[]> {
  return await invoke('read_form_file', { form_id });
}

export async function get_app_data_dir(): Promise<string> {
  return await invoke('get_app_data_dir');
}

export const FORM_CATEGORIES = [
  'Birth Certificate',
  'Caste Certificate',
  'Income Certificate',
  'Residence Certificate',
  'Scholarship',
  'Pension',
  'Court',
  'School',
  'Government Forms',
  'Other',
] as const;

export const SAMPLE_STATES = [
  'Madhya Pradesh',
  'Uttar Pradesh',
  'Bihar',
  'Rajasthan',
  'Maharashtra',
  'Gujarat',
  'Delhi',
  'Other',
] as const;

export const SAMPLE_DISTRICTS: Record<string, string[]> = {
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Other': ['Other'],
};