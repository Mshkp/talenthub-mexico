import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import api from '../services/api';
import { showSuccess, showError } from '../utils/alerts';

const Checkout: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Configuración inicial con tu llave de Sandbox
  const initialOptions = {
    clientId: "AekJ2ycu6mOuqPUg8IG97Z7KVb_tawnIH2V6gX6qzSPRh1ilpvFlgwFwVdrPzE_R3e6atC-jqbS49bvX",
    currency: "MXN",
    intent: "capture",
  };

  // 1. React le pide a Django que cree la orden
  const crearOrden = async () => {
    try {
      // Llamamos a tu ruta que ya existe
      const response = await api.post('/pago/crear/', { plan_id: planId });
      
      // OJO AQUÍ: Django debe devolvernos el ID de la orden generada por PayPal
      // Ej. { "id": "5O190127TN364715T" }
      return response.data.id; 
    } catch (error) {
      showError("No se pudo conectar con el servidor de pagos", "Error");
      throw error;
    }
  };

  // 2. React le avisa a Django que el pago en el Sandbox fue un éxito
  const capturarOrden = async (data: any) => {
    setLoading(true);
    try {
      // data.orderID es el recibo que nos da PayPal después de cobrar
      await api.post('/pago/capturar/', {order_id: data.orderID, plan_id: planId});

      
      showSuccess("¡Tu pago ha sido procesado!", "Bienvenido a tu nuevo plan");
      
      // Lo mandamos de regreso a su panel
      const userTipo = localStorage.getItem('user_tipo');
      if (userTipo === 'empresa') {
        navigate('/dashboard');
      } else {
        navigate('/vacantes');
      }
    } catch (error) {
      showError("Hubo un problema al validar tu pago", "Error en la captura");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
        
        {/* Decoración superior */}
        <div className="absolute top-0 left-0 w-full h-2 bg-talenthub-blue"></div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Completar Pago</h1>
        <p className="text-gray-500 mb-8 font-medium">Estás a un paso de potenciar tu cuenta</p>

        {/* Contenedor de los botones de PayPal */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner z-10 relative">
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons 
              createOrder={crearOrden} 
              onApprove={capturarOrden}
              style={{ layout: "vertical", shape: "rect", color: "blue" }}
              onError={() => showError("El pago fue cancelado o hubo un error con PayPal")}
            />
          </PayPalScriptProvider>
        </div>

        {loading && <p className="text-talenthub-blue font-bold mt-4 animate-pulse">Validando pago con el servidor...</p>}

        <Link to="/planes" className="block mt-6 text-gray-500 hover:text-gray-700 font-semibold transition">
          Cancelar y volver a planes
        </Link>
      </div>
    </div>
  );
};

export default Checkout;