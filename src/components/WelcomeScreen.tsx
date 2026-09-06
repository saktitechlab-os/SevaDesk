import { useState } from 'react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onClose: () => void;
}

export function WelcomeScreen({ onClose }: WelcomeScreenProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: '⌨',
      title: 'Welcome to SevaDesk',
      description: 'Your Hindi typing and forms utility for offline use.',
    },
    {
      icon: '🔤',
      title: 'Unicode → Kruti Dev Converter',
      description: 'Type or paste Hindi Unicode text and convert it to Kruti Dev 010 encoding for MS Word. Works completely offline.',
    },
    {
      icon: '📋',
      title: 'Forms Library',
      description: 'Search, organize, and manage commonly used forms. Upload your own PDF, DOC, JPG, or TXT files with metadata.',
    },
    {
      icon: '🔒',
      title: '100% Offline',
      description: 'No internet required. All your data stays on your machine. Free demo includes full converter access.',
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <div className="welcome-header">
          <div className="welcome-icon">{currentStep.icon}</div>
          <h2>{currentStep.title}</h2>
          <p>{currentStep.description}</p>
        </div>

        <div className="welcome-progress">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`progress-dot ${i <= step ? 'active' : ''} ${i === step ? 'current' : ''}`}
            />
          ))}
        </div>

        <div className="welcome-footer">
          {step > 0 && (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
              ← Back
            </button>
          )}
          
          <div className="footer-center">
            <span className="step-indicator">{step + 1} of {steps.length}</span>
          </div>
          
          {isLastStep ? (
            <button className="btn btn-primary" onClick={onClose}>
              Get Started →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              Next →
            </button>
          )}
        </div>

        <div className="welcome-note">
          <p><strong>Demo Notice:</strong> Unicode → Kruti Dev conversion is available in the demo.</p>
          <p>For official government forms, please visit the respective department websites.</p>
        </div>
      </div>
    </div>
  );
}