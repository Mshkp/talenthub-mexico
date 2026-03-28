import Swal from 'sweetalert2';

// 1. Creamos una "plantilla" base usando las clases de Tailwind
const tailwindSwal = Swal.mixin({
  customClass: {
    confirmButton: 'bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition mx-2',
    cancelButton: 'bg-gray-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-600 transition mx-2'
  },
  buttonsStyling: false // ¡Esto apaga los botones feos por defecto!
});

// 2. Alerta de Éxito
export const showSuccess = (texto: string, titulo = '¡Éxito!') => {
  return tailwindSwal.fire({
    icon: 'success',
    title: titulo,
    text: texto,
  });
};

// 3. Alerta de Error
export const showError = (texto: string, titulo = '¡Oops!') => {
  return tailwindSwal.fire({
    icon: 'error',
    title: titulo,
    text: texto,
  });
};

// 4. Alerta de Confirmación
export const showConfirm = async (texto: string, titulo = '¿Estás seguro?') => {
  const result = await tailwindSwal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    customClass: {
      confirmButton: 'bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition mx-2', // Rojo para peligro
      cancelButton: 'bg-gray-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-600 transition mx-2'
    }
  });
  
  return result.isConfirmed; 
};