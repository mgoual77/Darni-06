import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!email) {
      setMessage('Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      
      if (error) {
        setMessage(error.message);
      } else {
        setStep(2);
        setMessage('Code envoyé à votre adresse email');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setMessage('Veuillez entrer le code à 6 chiffres');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.verifyOtp({ 
        email, 
        token: otp, 
        type: 'email' 
      });
      
      if (error) {
        setMessage(error.message);
      } else {
        setIsSuccess(true);
        setMessage('Connexion réussie !');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      }
    } catch (error) {
      setMessage('Erreur lors de la vérification du code');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setOtp('');
    setStep(1);
    setMessage('');
    setIsSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'Lato, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 32,
        width: '90%',
        maxWidth: 400,
        position: 'relative'
      }}>
        <button
          onClick={handleClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 24,
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#6b7280'
          }}
        >
          ×
        </button>

        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 24,
          color: '#1f2937',
          textAlign: 'center'
        }}>
          {step === 1 ? 'Connexion' : 'Vérification'}
        </h2>

        {isSuccess ? (
          <div style={{
            textAlign: 'center',
            padding: 20,
            backgroundColor: '#f0fdf4',
            borderRadius: 12,
            border: '1px solid #86efac'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <p style={{ color: '#16a34a', fontSize: 16, fontWeight: 600 }}>
              {message}
            </p>
          </div>
        ) : (
          <>
            {step === 1 ? (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: loading ? '#9ca3af' : '#1B4FD8',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Code à 6 chiffres
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 20,
                      textAlign: 'center',
                      letterSpacing: 4,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: loading ? '#9ca3af' : '#1B4FD8',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {loading ? 'Vérification...' : 'Confirmer'}
                </button>

                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: 12
                  }}
                >
                  Retour
                </button>
              </div>
            )}

            {message && !isSuccess && (
              <div style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: '#fef2f2',
                borderRadius: 8,
                border: '1px solid #fecaca'
              }}>
                <p style={{ 
                  color: '#dc2626', 
                  fontSize: 14,
                  margin: 0 
                }}>
                  {message}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
