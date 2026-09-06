use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Form {
    pub id: String,
    pub name: String,
    pub category: String,
    pub state: String,
    pub district: String,
    pub description: String,
    pub file_path: String,
    pub file_type: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FormsData {
    pub forms: Vec<Form>,
}

fn get_forms_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    fs::create_dir_all(&app_data_dir).map_err(|e| format!("Failed to create app data dir: {}", e))?;
    
    let forms_dir = app_data_dir.join("forms");
    fs::create_dir_all(&forms_dir).map_err(|e| format!("Failed to create forms dir: {}", e))?;
    
    Ok(app_data_dir.join("forms.json"))
}

#[tauri::command]
pub fn get_forms(app: AppHandle) -> Result<Vec<Form>, String> {
    let forms_file = get_forms_file_path(&app)?;
    
    if !forms_file.exists() {
        let default_forms = create_default_forms(&app)?;
        return Ok(default_forms);
    }
    
    let content = fs::read_to_string(&forms_file)
        .map_err(|e| format!("Failed to read forms file: {}", e))?;
    
    let data: FormsData = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse forms JSON: {}", e))?;
    
    Ok(data.forms)
}

#[tauri::command]
pub fn add_form(
    app: AppHandle,
    name: String,
    category: String,
    state: String,
    district: String,
    description: String,
    file_path: String,
    file_type: String,
) -> Result<Form, String> {
    let forms_file = get_forms_file_path(&app)?;
    
    let mut forms = if forms_file.exists() {
        let content = fs::read_to_string(&forms_file)
            .map_err(|e| format!("Failed to read forms file: {}", e))?;
        let data: FormsData = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse forms JSON: {}", e))?;
        data.forms
    } else {
        Vec::new()
    };
    
    let new_form = Form {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        category,
        state,
        district,
        description,
        file_path,
        file_type,
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    forms.push(new_form.clone());
    
    let data = FormsData { forms };
    let content = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize forms: {}", e))?;
    
    fs::write(&forms_file, content)
        .map_err(|e| format!("Failed to write forms file: {}", e))?;
    
    Ok(new_form)
}

#[tauri::command]
pub fn delete_form(app: AppHandle, id: String) -> Result<(), String> {
    let forms_file = get_forms_file_path(&app)?;
    
    let content = fs::read_to_string(&forms_file)
        .map_err(|e| format!("Failed to read forms file: {}", e))?;
    let mut data: FormsData = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse forms JSON: {}", e))?;
    
    data.forms.retain(|f| f.id != id);
    
    let content = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize forms: {}", e))?;
    
    fs::write(&forms_file, content)
        .map_err(|e| format!("Failed to write forms file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub fn search_forms(app: AppHandle, query: String, category: Option<String>) -> Result<Vec<Form>, String> {
    let forms = get_forms(app)?;
    
    let filtered: Vec<Form> = forms
        .into_iter()
        .filter(|f| {
            let matches_query = query.is_empty() 
                || f.name.to_lowercase().contains(&query.to_lowercase())
                || f.description.to_lowercase().contains(&query.to_lowercase())
                || f.category.to_lowercase().contains(&query.to_lowercase())
                || f.district.to_lowercase().contains(&query.to_lowercase())
                || f.state.to_lowercase().contains(&query.to_lowercase());
            
            let matches_category = category.as_ref().map_or(true, |c| &f.category == c);
            
            matches_query && matches_category
        })
        .collect();
    
    Ok(filtered)
}

#[tauri::command]
pub fn export_form(app: AppHandle, form_id: String, dest_path: String) -> Result<(), String> {
    let forms = get_forms(app)?;
    let form = forms.iter().find(|f| f.id == form_id)
        .ok_or("Form not found")?;
    
    let source = std::path::Path::new(&form.file_path);
    let dest = std::path::Path::new(&dest_path);
    
    if !source.exists() {
        return Err("Source file does not exist".to_string());
    }
    
    fs::copy(source, dest)
        .map_err(|e| format!("Failed to copy file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub fn read_form_file(app: AppHandle, form_id: String) -> Result<Vec<u8>, String> {
    let forms = get_forms(app)?;
    let form = forms.iter().find(|f| f.id == form_id)
        .ok_or("Form not found")?;
    
    let path = std::path::Path::new(&form.file_path);
    
    if !path.exists() {
        return Err("File does not exist".to_string());
    }
    
    let content = fs::read(path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    Ok(content)
}

#[tauri::command]
pub fn get_app_data_dir(app: AppHandle) -> Result<String, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    Ok(dir.to_string_lossy().to_string())
}

fn create_default_forms(app: &AppHandle) -> Result<Vec<Form>, String> {
    let forms_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?
        .join("forms");
    
    fs::create_dir_all(&forms_dir).map_err(|e| format!("Failed to create forms dir: {}", e))?;
    
    let default_forms = vec![
        Form {
            id: "1".to_string(),
            name: "Birth Certificate Application".to_string(),
            category: "Birth Certificate".to_string(),
            state: "Madhya Pradesh".to_string(),
            district: "Indore".to_string(),
            description: "Standard birth certificate application form".to_string(),
            file_path: forms_dir.join("birth_certificate.txt").to_string_lossy().to_string(),
            file_type: "TXT".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
        },
        Form {
            id: "2".to_string(),
            name: "Caste Certificate Application".to_string(),
            category: "Caste Certificate".to_string(),
            state: "Madhya Pradesh".to_string(),
            district: "Indore".to_string(),
            description: "Caste certificate application form for SC/ST/OBC".to_string(),
            file_path: forms_dir.join("caste_certificate.txt").to_string_lossy().to_string(),
            file_type: "TXT".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
        },
        Form {
            id: "3".to_string(),
            name: "Income Certificate Application".to_string(),
            category: "Income Certificate".to_string(),
            state: "Madhya Pradesh".to_string(),
            district: "Indore".to_string(),
            description: "Income certificate application form".to_string(),
            file_path: forms_dir.join("income_certificate.txt").to_string_lossy().to_string(),
            file_type: "TXT".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
        },
        Form {
            id: "4".to_string(),
            name: "Residence Certificate Application".to_string(),
            category: "Residence Certificate".to_string(),
            state: "Madhya Pradesh".to_string(),
            district: "Indore".to_string(),
            description: "Residence/Domicile certificate application form".to_string(),
            file_path: forms_dir.join("residence_certificate.txt").to_string_lossy().to_string(),
            file_type: "TXT".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
        },
        Form {
            id: "5".to_string(),
            name: "Scholarship Application Form".to_string(),
            category: "Scholarship".to_string(),
            state: "Madhya Pradesh".to_string(),
            district: "Indore".to_string(),
            description: "Student scholarship application form".to_string(),
            file_path: forms_dir.join("scholarship.txt").to_string_lossy().to_string(),
            file_type: "TXT".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
        },
        Form {
            id: "6".to_string(),
            name: "Pension Application Form".to_string(),
            category: "Pension".to_string(),
            state: "Madhya Pradesh".to_string(),
            district: "Indore".to_string(),
            description: "Old age / widow pension application form".to_string(),
            file_path: forms_dir.join("pension.txt").to_string_lossy().to_string(),
            file_type: "TXT".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
        },
        Form {
            id: "7".to_string(),
            name: "Court Application Form".to_string(),
            category: "Court".to_string(),
            state: "Madhya Pradesh".to_string(),
            district: "Indore".to_string(),
            description: "General court application / petition format".to_string(),
            file_path: forms_dir.join("court.txt").to_string_lossy().to_string(),
            file_type: "TXT".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
        },
        Form {
            id: "8".to_string(),
            name: "School Admission Form".to_string(),
            category: "School".to_string(),
            state: "Madhya Pradesh".to_string(),
            district: "Indore".to_string(),
            description: "School admission application form".to_string(),
            file_path: forms_dir.join("school_admission.txt").to_string_lossy().to_string(),
            file_type: "TXT".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
        },
    ];
    
    for form in &default_forms {
        create_sample_form_file(&form.file_path, &form.name, &form.category)?;
    }
    
    let data = FormsData { forms: default_forms.clone() };
    let content = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize forms: {}", e))?;
    
    let forms_file = get_forms_file_path(app)?;
    fs::write(&forms_file, content)
        .map_err(|e| format!("Failed to write forms file: {}", e))?;
    
    Ok(default_forms)
}

fn create_sample_form_file(path: &str, name: &str, category: &str) -> Result<(), String> {
    let content = format!(
        "=== {} ===\n\nCategory: {}\n\nThis is a sample/demo form for demonstration purposes only.\nIt is NOT an official government form.\n\nPlease obtain official forms from the respective government department.\n\n--- Form Content ---\n\nApplicant Name: _________________________\nFather/Husband Name: _________________________\nDate of Birth: _________________________\nAddress: _________________________\n_________________________\n_________________________\n\nPurpose: _________________________\n_________________________\n\nDate: _________________________\nSignature: _________________________\n\n--- End of Form ---\n\nNote: This is a demo document. For official use, please visit the relevant government office or website.",
        name, category
    );
    
    fs::write(path, content)
        .map_err(|e| format!("Failed to create sample form: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub fn save_form_file(file_path: String, data: Vec<u8>) -> Result<(), String> {
    let path = std::path::Path::new(&file_path);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    fs::write(path, data)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn open_data_folder(app: AppHandle) -> Result<(), String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(dir)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(dir)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(dir)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub fn reset_app_data(app: AppHandle) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    if app_data_dir.exists() {
        fs::remove_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to remove app data: {}", e))?;
    }
    
    Ok(())
}