/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import PasswordValidator from '../../components/PasswordValidator';
import api from '../../services/api';
import { showSuccess, showError } from '../../utils/alerts';

export default function RestablecerPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validación de políticas (S-SDLC)
    if (!isPasswordValid) {
      showError('La contraseña no cumple con los requisitos de seguridad.');
      return;
    }

    // 2. Validación de coincidencia
    if (password !== confirmPassword) {
      showError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      // 3. Petición al API
      await api.post('/confirmar-password/', { 
        uid, 
        token, 
        new_password: password 
      });

      // 4. Feedback visual con pausa (Configurado en alerts.ts)
      await showSuccess('¡Contraseña actualizada!', 'Redirigiendo al login...');
      
      // 5. Redirección
      navigate('/login');

    } catch (error) {
      const msg = error.response?.data?.error || 'Error crítico de conexión.';
      showError(msg);
    } finally {
      setCargando(false);
    }
  };

  const styles = {
    wrapper: {
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F9FAFB',
      padding: '20px'
    },
    card: {
      background: 'white',
      borderTop: '4px solid #3b82f6',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '440px',
      padding: '40px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      boxSizing: 'border-box'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    title: {
      color: '#111827',
      fontSize: '1.6rem',
      fontWeight: 'bold',
      margin: '10px 0 5px 0'
    },
    subtitle: {
      fontSize: '0.95rem',
      color: '#6b7280',
      margin: 0
    },
    inputGroup: {
      position: 'relative',
      marginBottom: '20px'
    },
    inputIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    input: {
      width: '100%',
      background: 'white',
      border: '1px solid #e5e7eb',
      color: '#111827',
      padding: '12px 12px 12px 48px',
      borderRadius: '8px',
      fontSize: '0.95rem',
      boxSizing: 'border-box',
      outline: 'none'
    },
    button: {
      width: '100%',
      background: '#0f172a',
      color: 'white',
      fontWeight: '600',
      fontSize: '1rem',
      padding: '12px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px'
    },
    buttonDisabled: {
      opacity: '0.7',
      cursor: 'not-allowed'
    }
  };

  return (
    <div style={styles.wrapper}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <ShieldCheck size={44} color="#3b82f6" />
          <h2 style={styles.title}>Nueva Contraseña</h2>
          <p style={styles.subtitle}>Define tus credenciales de acceso</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <Lock style={styles.inputIcon} size={20} />
            <input 
              type="password" 
              style={styles.input}
              placeholder="Nueva contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {password.length > 0 && (
            <PasswordValidator 
              password={password} 
              onValidationChange={setIsPasswordValid} 
            />
          )}

          <div style={styles.inputGroup}>
            <Lock style={styles.inputIcon} size={20} />
            <input 
              type="password" 
              style={styles.input}
              placeholder="Confirma la contraseña" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{...styles.button, ...(cargando ? styles.buttonDisabled : {})}} 
            disabled={cargando}
          >
            {cargando ? (
              <><Loader2 style={{ animation: 'spin 1s linear infinite' }} size={20} /> ACTUALIZANDO...</>
            ) : (
              'ACTUALIZAR CONTRASEÑA'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
