import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

// Si usas .jsx, puedes quitar la interfaz de TypeScript
interface PasswordValidatorProps {
  password: string;
  onValidationChange: (isValid: boolean) => void;
}

export default function PasswordValidator({ password, onValidationChange }: PasswordValidatorProps) {
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  // Efecto que evalúa la contraseña cada vez que cambia
  useEffect(() => {
    const length = password.length >= 8;
    const uppercase = /[A-Z]/.test(password);
    const number = /[0-9]/.test(password);
    const special = /[^A-Za-z0-9]/.test(password);

    setRequirements({ length, uppercase, number, special });

    // Informar al componente padre si la contraseña ya es 100% segura
    onValidationChange(length && uppercase && number && special);
  }, [password, onValidationChange]);

  // Calcular porcentaje para la barra visual (cada requisito vale 25%)
  const score = Object.values(requirements).filter(Boolean).length;
  const progressPercentage = score * 25;

  // Determinar color de la barra según el nivel de seguridad
  const getProgressBarColor = () => {
    if (score <= 1) return '#ef4444'; // Rojo (Débil)
    if (score === 2) return '#f59e0b'; // Naranja (Regular)
    if (score === 3) return '#3b82f6'; // Azul (Buena)
    return '#10b981'; // Verde (Segura)
  };

  const styles = {
    container: {
      marginTop: '10px',
      marginBottom: '20px',
      padding: '12px',
      backgroundColor: '#F9FAFB',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '0.85rem',
      color: '#4b5563'
    },
    progressBarBackground: {
      height: '6px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      marginBottom: '10px',
      overflow: 'hidden'
    },
    progressBarFill: {
      height: '100%',
      width: `${progressPercentage}%`,
      backgroundColor: getProgressBarColor(),
      transition: 'all 0.3s ease-in-out'
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px'
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: '8px', fontWeight: '600', color: '#111827' }}>
        Nivel de seguridad: {score === 4 ? 'Óptima' : score >= 2 ? 'Media' : 'Débil'}
      </div>
      
      <div style={styles.progressBarBackground}>
        <div style={styles.progressBarFill}></div>
      </div>

      <ul style={styles.list}>
        <li style={styles.listItem}>
          {requirements.length ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#9ca3af" />}
          <span>Mínimo 8 caracteres</span>
        </li>
        <li style={styles.listItem}>
          {requirements.uppercase ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#9ca3af" />}
          <span>Una mayúscula</span>
        </li>
        <li style={styles.listItem}>
          {requirements.number ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#9ca3af" />}
          <span>Un número</span>
        </li>
        <li style={styles.listItem}>
          {requirements.special ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#9ca3af" />}
          <span>Un carácter especial</span>
        </li>
      </ul>
    </div>
  );
}