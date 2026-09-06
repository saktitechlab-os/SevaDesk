import { invoke } from '@tauri-apps/api/core';

export interface ConversionResult {
  kruti_dev_text: string;
  success: boolean;
  error: string | null;
}

export async function convert_unicode_to_kruti_dev(unicodeText: string): Promise<ConversionResult> {
  return await invoke('convert_unicode_to_kruti_dev', { unicode_text: unicodeText });
}

export async function copy_to_clipboard(text: string): Promise<void> {
  return await invoke('copy_to_clipboard', { text });
}

export async function open_file_dialog(): Promise<string | null> {
  return await invoke('open_file_dialog');
}

export async function save_file_dialog(): Promise<string | null> {
  return await invoke('save_file_dialog');
}

export async function print_text(text: string): Promise<void> {
  return await invoke('print_text', { text });
}