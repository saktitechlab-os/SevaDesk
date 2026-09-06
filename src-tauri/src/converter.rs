use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversionResult {
    pub kruti_dev_text: String,
    pub success: bool,
    pub error: Option<String>,
}

#[tauri::command]
pub fn convert_unicode_to_kruti_dev(unicode_text: String) -> Result<ConversionResult, String> {
    if unicode_text.trim().is_empty() {
        return Ok(ConversionResult {
            kruti_dev_text: String::new(),
            success: true,
            error: None,
        });
    }

    match unicode_to_kruti_dev(&unicode_text) {
        Ok(result) => Ok(ConversionResult {
            kruti_dev_text: result,
            success: true,
            error: None,
        }),
        Err(e) => Ok(ConversionResult {
            kruti_dev_text: String::new(),
            success: false,
            error: Some(e),
        }),
    }
}

fn unicode_to_kruti_dev(input: &str) -> Result<String, String> {
    let chars: Vec<char> = input.chars().collect();
    let mut output = String::new();
    let mut i = 0;
    
    while i < chars.len() {
        let ch = chars[i];
        
        if is_devanagari(ch) {
            let converted = convert_devanagari_char(&chars, &mut i)?;
            output.push_str(&converted);
        } else {
            output.push(ch);
            i += 1;
        }
    }
    
    Ok(output)
}

fn is_devanagari(ch: char) -> bool {
    ('\u{0900}'..='\u{097F}').contains(&ch)
}

fn convert_devanagari_char(chars: &[char], i: &mut usize) -> Result<String, String> {
    // Check for conjuncts first (multi-character sequences)
    if *i + 1 < chars.len() {
        let two_chars: String = chars[*i..=*i+1].iter().collect();
        match two_chars.as_str() {
            "क्ष" => { *i += 2; return Ok("\u{006B}\u{008B}\u{0073}".to_string()); } // k + virama + s
            "त्र" => { *i += 2; return Ok("\u{0074}\u{008B}\u{0072}".to_string()); } // t + virama + r
            "ज्ञ" => { *i += 2; return Ok("\u{006A}\u{008B}\u{006E}".to_string()); } // j + virama + n
            "श्र" => { *i += 2; return Ok("\u{005C}\u{008B}\u{0072}".to_string()); } // S + virama + r
            _ => {}
        }
    }
    
    let ch = chars[*i];
    let mut result = String::new();
    
    match ch {
        // Vowels
        'अ' => result.push('\u{0061}'),        // a
        'आ' => result.push('\u{00C0}'),        // A
        'इ' => result.push('\u{0069}'),        // i
        'ई' => result.push('\u{00CC}'),        // I
        'उ' => result.push('\u{0075}'),        // u
        'ऊ' => result.push('\u{00DC}'),        // U
        'ऋ' => result.push('\u{008D}'),        // R
        'ए' => result.push('\u{0065}'),        // e
        'ऐ' => result.push('\u{00C8}'),        // E
        'ओ' => result.push('\u{006F}'),        // o
        'औ' => result.push('\u{00D4}'),        // O
        
        // Consonants
        'क' => result.push('\u{006B}'),        // k
        'ख' => result.push('\u{005B}'),        // K
        'ग' => result.push('\u{0067}'),        // g
        'घ' => result.push('\u{005D}'),        // G
        'ङ' => result.push('\u{007C}'),        // |
        'च' => result.push('\u{0063}'),        // c
        'छ' => result.push('\u{005E}'),        // C
        'ज' => result.push('\u{006A}'),        // j
        'झ' => result.push('\u{005F}'),        // J
        'ञ' => result.push('\u{007E}'),        // ~
        'ट' => result.push('\u{0074}'),        // t
        'ठ' => result.push('\u{005C}'),        // T
        'ड' => result.push('\u{0064}'),        // d
        'ढ' => result.push('\u{005C}'),        // D (same as ठ in Kruti Dev)
        'ण' => result.push('\u{007E}'),        // N
        'त' => result.push('\u{0074}'),        // t
        'थ' => result.push('\u{005C}'),        // T
        'द' => result.push('\u{0064}'),        // d
        'ध' => result.push('\u{005C}'),        // D
        'न' => result.push('\u{006E}'),        // n
        'प' => result.push('\u{0070}'),        // p
        'फ' => result.push('\u{005D}'),        // P
        'ब' => result.push('\u{0062}'),        // b
        'भ' => result.push('\u{005D}'),        // B
        'म' => result.push('\u{006D}'),        // m
        'य' => result.push('\u{0079}'),        // y
        'र' => result.push('\u{0072}'),        // r
        'ल' => result.push('\u{006C}'),        // l
        'व' => result.push('\u{0076}'),        // v
        'श' => result.push('\u{005C}'),        // S
        'ष' => result.push('\u{005C}'),        // S
        'स' => result.push('\u{0073}'),        // s
        'ह' => result.push('\u{0068}'),        // h
        
        // Matras (vowel signs)
        'ा' => result.push('\u{00E0}'),        // aa matra
        'ि' => result.push('\u{00EC}'),        // i matra
        'ी' => result.push('\u{00ED}'),        // ii matra
        'ु' => result.push('\u{00F9}'),        // u matra
        'ू' => result.push('\u{00FA}'),        // uu matra
        'ृ' => result.push('\u{00FB}'),        // ri matra
        'े' => result.push('\u{00E9}'),        // e matra
        'ै' => result.push('\u{00EA}'),        // ai matra
        'ो' => result.push('\u{00EF}'),        // o matra
        'ौ' => result.push('\u{00F0}'),        // au matra
        
        // Special characters
        'ं' => result.push('\u{008A}'),        // anusvara
        'ः' => result.push('\u{008B}'),        // visarga
        '्' => result.push('\u{008B}'),        // virama/halant
        'ँ' => result.push('\u{0089}'),        // candrabindu
        'ऽ' => result.push('\u{009C}'),        // avagraha
        
        // Numbers
        '०' => result.push('\u{0030}'),
        '१' => result.push('\u{0031}'),
        '२' => result.push('\u{0032}'),
        '३' => result.push('\u{0033}'),
        '४' => result.push('\u{0034}'),
        '५' => result.push('\u{0035}'),
        '६' => result.push('\u{0036}'),
        '७' => result.push('\u{0037}'),
        '८' => result.push('\u{0038}'),
        '९' => result.push('\u{0039}'),
        
        // Punctuation
        '।' => result.push('\u{009D}'),
        '॥' => result.push('\u{009E}'),
        
        // ZWJ/ZWNJ
        '\u{200D}' => { *i += 1; return Ok(String::new()); }, // ZWJ - skip
        '\u{200C}' => { *i += 1; return Ok(String::new()); }, // ZWNJ - skip
        
        _ => {
            // For any other Devanagari character, try to handle as consonant + matra
            if is_consonant(ch) {
                result.push_str(&consonant_to_kruti(ch));
                *i += 1;
                
                // Check for following matra
                if *i < chars.len() {
                    let next = chars[*i];
                    if is_matra(next) {
                        result.push_str(&matra_to_kruti(next));
                        *i += 1;
                    }
                }
                return Ok(result);
            }
            
            // Unknown Devanagari char, skip
            *i += 1;
            return Ok(String::new());
        }
    }
    
    *i += 1;
    Ok(result)
}

fn is_consonant(ch: char) -> bool {
    matches!(ch,
        'क' | 'ख' | 'ग' | 'घ' | 'ङ' |
        'च' | 'छ' | 'ज' | 'झ' | 'ञ' |
        'ट' | 'ठ' | 'ड' | 'ढ' | 'ण' |
        'त' | 'थ' | 'द' | 'ध' | 'न' |
        'प' | 'फ' | 'ब' | 'भ' | 'म' |
        'य' | 'र' | 'ल' | 'व' |
        'श' | 'ष' | 'स' | 'ह'
    )
}

fn is_matra(ch: char) -> bool {
    matches!(ch,
        'ा' | 'ि' | 'ी' | 'ु' | 'ू' | 'ृ' | 'े' | 'ै' | 'ो' | 'ौ' |
        'ं' | 'ः' | '्' | 'ँ' | 'ऽ'
    )
}

fn consonant_to_kruti(ch: char) -> String {
    match ch {
        'क' => "\u{006B}".to_string(),
        'ख' => "\u{005B}".to_string(),
        'ग' => "\u{0067}".to_string(),
        'घ' => "\u{005D}".to_string(),
        'ङ' => "\u{007C}".to_string(),
        'च' => "\u{0063}".to_string(),
        'छ' => "\u{005E}".to_string(),
        'ज' => "\u{006A}".to_string(),
        'झ' => "\u{005F}".to_string(),
        'ञ' => "\u{007E}".to_string(),
        'ट' => "\u{0074}".to_string(),
        'ठ' => "\u{005C}".to_string(),
        'ड' => "\u{0064}".to_string(),
        'ढ' => "\u{005C}".to_string(),
        'ण' => "\u{007E}".to_string(),
        'त' => "\u{0074}".to_string(),
        'थ' => "\u{005C}".to_string(),
        'द' => "\u{0064}".to_string(),
        'ध' => "\u{005C}".to_string(),
        'न' => "\u{006E}".to_string(),
        'प' => "\u{0070}".to_string(),
        'फ' => "\u{005D}".to_string(),
        'ब' => "\u{0062}".to_string(),
        'भ' => "\u{005D}".to_string(),
        'म' => "\u{006D}".to_string(),
        'य' => "\u{0079}".to_string(),
        'र' => "\u{0072}".to_string(),
        'ल' => "\u{006C}".to_string(),
        'व' => "\u{0076}".to_string(),
        'श' => "\u{005C}".to_string(),
        'ष' => "\u{005C}".to_string(),
        'स' => "\u{0073}".to_string(),
        'ह' => "\u{0068}".to_string(),
        _ => String::new(),
    }
}

fn matra_to_kruti(ch: char) -> String {
    match ch {
        'ा' => "\u{00E0}".to_string(),
        'ि' => "\u{00EC}".to_string(),
        'ी' => "\u{00ED}".to_string(),
        'ु' => "\u{00F9}".to_string(),
        'ू' => "\u{00FA}".to_string(),
        'ृ' => "\u{00FB}".to_string(),
        'े' => "\u{00E9}".to_string(),
        'ै' => "\u{00EA}".to_string(),
        'ो' => "\u{00EF}".to_string(),
        'ौ' => "\u{00F0}".to_string(),
        'ं' => "\u{008A}".to_string(),
        'ः' => "\u{008B}".to_string(),
        '्' => "\u{008B}".to_string(),
        'ँ' => "\u{0089}".to_string(),
        'ऽ' => "\u{009C}".to_string(),
        _ => String::new(),
    }
}

#[tauri::command]
pub fn copy_to_clipboard(_text: String) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub fn open_file_dialog() -> Result<Option<String>, String> {
    Ok(None)
}

#[tauri::command]
pub fn save_file_dialog() -> Result<Option<String>, String> {
    Ok(None)
}

#[tauri::command]
pub fn print_text(_text: String) -> Result<(), String> {
    Ok(())
}