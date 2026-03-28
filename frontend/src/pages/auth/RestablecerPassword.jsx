import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Loader2, Info, AlertTriangle } from 'lucide-react';
import PasswordValidator from '../../components/PasswordValidator'; // Ajusta la ruta según donde lo guardes

export default function RestablecerPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [cargando, setCargando] = useState(false);
  
  // NUEVO ESTADO: Controla si la contraseña pasó la validación del componente
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);
    
    // Validación de seguridad (S-SDLC) antes de enviar al backend
    if (!isPasswordValid) {
      setEsError(true);
      setMensaje('La contraseña no cumple con las políticas de seguridad mínimas.');
      return;
    }

    if (password !== confirmPassword) {
      setEsError(true);
      setMensaje('Anomalía: Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/confirmar-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password: password })
      });

      const data = await response.json();

      if (response.ok) {
        setEsError(false);
        setMensaje('¡Credenciales actualizadas! Redirigiendo al puerto de acceso...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setEsError(true);
        setMensaje(data.error || 'Error al validar la nueva credencial.');
        setCargando(false);
      }
    } catch (error) {
      setEsError(true);
      setMensaje('Error crítico de conexión.');
      setCargando(false);
    }
  };



// ESTILOS TIPO TALENTHUB (Tarjetas clean con acento de color)
  const styles = {
    wrapper: {
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F9FAFB', // Fondo claro
      padding: '20px'
    },
    card: {
      background: 'white',
      borderTop: '4px solid #3b82f6', // ACENTO AZUL (Como tu tarjeta de usuarios)
      borderRadius: '12px',
      width: '100%',
      maxWidth: '440px',
      padding: '40px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)', // Sombra suave
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
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    button: {
      width: '100%',
      background: '#0f172a', // BOTÓN OSCURO
      color: 'white',
      fontWeight: '600',
      fontSize: '1rem',
      padding: '12px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px'
    },
    buttonDisabled: {
      opacity: '0.7',
      cursor: 'not-allowed'
    },
    messageBox: {
      marginTop: '24px',
      padding: '14px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'start',
      gap: '10px',
      boxSizing: 'border-box'
    },
    successMsg: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid #10b981',
      color: '#065f46'
    },
    errorMsg: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid #ef4444',
      color: '#991b1b'
    },
    spin: {
      animation: 'spin 1s linear infinite'
    }
  };





  return (
    <div style={styles.wrapper}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <ShieldCheck size={44} color="#3b82f6" />
          <h2 style={styles.title}>Establecer Nueva Contraseña</h2>
          <p style={styles.subtitle}>Define tus nuevas credenciales de acceso</p>
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

          {/* AQUÍ VA EL COMPONENTE DE VALIDACIÓN */}
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

          {/* El botón se deshabilita si está cargando o si la contraseña no es segura */}
          <button 
            type="submit" 
            style={{...styles.button, ...((cargando || !isPasswordValid) ? styles.buttonDisabled : {})}} 
            disabled={cargando || !isPasswordValid}
          >
            {cargando ? (
              <><Loader2 style={styles.spin} size={20} /> ACTUALIZANDO...</>
            ) : (
              'ACTUALIZAR CREDENCIAL'
            )}
          </button>
        </form>

        {/* ... (Mensajes de error/éxito) ... */}
      </div>
    </div>
  );
}