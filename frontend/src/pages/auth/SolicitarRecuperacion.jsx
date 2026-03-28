import { useState } from 'react';
import { Mail, KeyRound, Loader2, Info, AlertTriangle } from 'lucide-react';

export default function SolicitarRecuperacion() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [esError, setEsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');
    setEsError(false);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/recuperar-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setEsError(true);
      }
      setMensaje(data.mensaje || data.error);

    } catch (error) {
      setEsError(true);
      setMensaje('Error de conexión con el servidor.');
    } finally {
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
      borderTop: '4px solid #2563EB', // ACENTO AZUL (Como tu tarjeta de empresas)
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
      color: '#111827', // Texto oscuro TalentHub
      fontSize: '1.6rem',
      fontWeight: 'bold',
      margin: '10px 0 5px 0'
    },
    subtitle: {
      fontSize: '0.95rem',
      color: '#6b7280', // Gris claro
      margin: 0
    },
    inputGroup: {
      position: 'relative',
      marginBottom: '24px'
    },
    inputIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af' // Gris ícono
    },
    input: {
      width: '100%',
      background: 'white',
      border: '1px solid #e5e7eb', // Borde gris claro
      color: '#111827',
      padding: '12px 12px 12px 48px', // Espacio para el ícono
      borderRadius: '8px',
      fontSize: '0.95rem',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    // Efecto focus para los inputs
    inputFocus: {
      borderColor: '#2563EB' // Azul en focus
    },
    button: {
      width: '100%',
      background: '#2563EB', // BOTÓN OSCURO (Tono de TalentHub México)
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
      color: '#065f46' // Verde oscuro
    },
    errorMsg: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid #ef4444',
      color: '#991b1b' // Rojo oscuro
    },
    spin: {
      animation: 'spin 1s linear infinite'
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Definir animación de giro en línea */}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <KeyRound size={44} color="#2563EB" />
          <h2 style={styles.title}>Recuperar Contraseña</h2>
          <p style={styles.subtitle}>Ingresa tu correo y te enviaremos un enlace seguro</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <Mail style={styles.inputIcon} size={20} />
            <input 
              type="email" 
              style={styles.input}
              placeholder="operador@tuempresa.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={{...styles.button, ...(cargando ? styles.buttonDisabled : {})}} disabled={cargando}>
            {cargando ? (
              <><Loader2 style={styles.spin} size={20} /> ENVIANDO...</>
            ) : (
              'ENVIAR ENLACE'
            )}
          </button>
        </form>

        {mensaje && (
          <div style={{...styles.messageBox, ...(esError ? styles.errorMsg : styles.successMsg)}}>
            {esError ? <AlertTriangle size={18} /> : <Info size={18} />}
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}