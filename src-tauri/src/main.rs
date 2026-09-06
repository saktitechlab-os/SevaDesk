#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod commands;
mod converter;
mod forms;

use commands::*;
use forms::*;
use converter::*;

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_notification::init())
    .invoke_handler(tauri::generate_handler![
      convert_unicode_to_kruti_dev,
      copy_to_clipboard,
      open_file_dialog,
      save_file_dialog,
      get_forms,
      add_form,
      delete_form,
      search_forms,
      export_form,
      get_app_data_dir,
      read_form_file,
      print_text,
      save_form_file,
      open_data_folder,
      reset_app_data
    ])
    .setup(|app| {
      #[cfg(debug_assertions)]
      {
        let window = app.get_webview_window("main").unwrap();
        window.open_devtools();
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}