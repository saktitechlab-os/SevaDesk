import './About.css';

export function About() {
  return (
    <div className="about-page">
      <div className="about-header">
        <div className="app-icon-large">⌨</div>
        <h1>SevaDesk</h1>
        <p className="tagline">Hindi Typing & Forms Library</p>
        <p className="version">Version 1.0.0</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>About SevaDesk</h2>
          <p>
            SevaDesk is a desktop utility designed for Indian online service centers (CSC-type shops) 
            and anyone who needs to work with Hindi text in Kruti Dev encoding.
          </p>
          <p>
            The application provides two core features: a <strong>Unicode to Kruti Dev converter</strong> 
            for typing Hindi in Unicode and converting it to Kruti Dev 010 encoding for use in MS Word 
            and other legacy applications, and a <strong>Forms Library</strong> for managing commonly 
            used government and administrative forms.
          </p>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <ul className="feature-list">
            <li>
              <span className="feature-icon">⌨</span>
              <div>
                <strong>Unicode → Kruti Dev Converter</strong>
                <p>Offline conversion with support for matras, conjuncts, half characters, reph, and punctuation</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">📋</span>
              <div>
                <strong>Forms Library</strong>
                <p>Search, organize, and manage forms by category, state, and district</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">⬆</span>
              <div>
                <strong>Form Upload</strong>
                <p>Add your own PDF, DOC, DOCX, JPG, PNG, or TXT forms with metadata</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🔒</span>
              <div>
                <strong>100% Offline</strong>
                <p>No internet required for core functionality. Your data stays on your machine</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🖨</span>
              <div>
                <strong>Print Ready</strong>
                <p>Direct print support with Kruti Dev font styling</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">💾</span>
              <div>
                <strong>Local Storage</strong>
                <p>All data stored locally in JSON + file system. Easy to backup and migrate</p>
              </div>
            </li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Converter Details</h2>
          <p>The converter implements proper Hindi Unicode-to-Kruti Dev character mapping including:</p>
          <ul className="detail-list">
            <li>All Devanagari vowels (अ, आ, इ, ई, उ, ऊ, ऋ, ए, ऐ, ओ, औ)</li>
            <li>All 36 consonants with proper Kruti Dev 010 byte mapping</li>
            <li>Matras (vowel signs): ा, ि, ी, ु, ू, ृ, े, ै, ो, ौ</li>
            <li>Special characters: Anusvara (ं), Visarga (ः), Virama/halant (्), Candrabindu (ँ)</li>
            <li>Common conjuncts: क्ष, त्र, ज्ञ, श्र</li>
            <li>Reph/Rakar forms for half-र</li>
            <li>Devanagari numbers (०-९) and punctuation (।, ॥)</li>
          </ul>
          <p className="note"><strong>Note:</strong> The output is actual Kruti Dev encoded text, not just a font change. 
          For best results in MS Word, apply the <strong>Kruti Dev 010</strong> font to the pasted text.</p>
        </section>

        <section className="about-section">
          <h2>Forms Library</h2>
          <p>Organize forms with metadata:</p>
          <ul className="detail-list">
            <li><strong>Categories:</strong> Birth Certificate, Caste Certificate, Income Certificate, Residence Certificate, Scholarship, Pension, Court, School, Government Forms, Other</li>
            <li><strong>Location:</strong> State and District hierarchy (extensible)</li>
            <li><strong>File types:</strong> PDF, DOC, DOCX, JPG, PNG, TXT</li>
            <li><strong>Actions:</strong> Open in browser, Export/Save As, Delete</li>
          </ul>
          <p className="note"><strong>Disclaimer:</strong> Demo forms included are sample templates only and are NOT official government documents. 
          Please obtain official forms from the respective government departments.</p>
        </section>

        <section className="about-section">
          <h2>Future Roadmap</h2>
          <ul className="detail-list">
            <li>Cloud synchronization for forms library</li>
            <li>Community form sharing</li>
            <li>Subscription/licensing system (₹7 trial, ₹499/6mo, ₹999/yr, ₹3000 lifetime)</li>
            <li>Enhanced converter with more conjuncts and ligatures</li>
            <li>Batch conversion for multiple files</li>
            <li>Keyboard shortcuts and productivity features</li>
          </ul>
        </section>

        <section className="about-section credits">
          <h2>Credits & License</h2>
          <p>Built with <strong>Tauri</strong>, <strong>React</strong>, <strong>TypeScript</strong>, and <strong>Rust</strong></p>
          <p>Designed for Indian CSC/online service centers</p>
          <p className="copyright">© 2025 SevaDesk. All rights reserved.</p>
        </section>
      </div>
    </div>
  );
}