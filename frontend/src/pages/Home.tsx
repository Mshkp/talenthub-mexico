import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-talenthub-blue to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">
            Conectando el mejor talento tecnológico
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Encuentra oportunidades en las mejores empresas de TI en México
          </p>
          <div className="space-x-4">
            <Link
              to="/vacantes"
              className="bg-white text-talenthub-blue px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition inline-block"
            >
              Ver Vacantes
            </Link>
            <Link
              to="/planes"
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition inline-block"
            >
              Publicar Vacante
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-talenthub-blue text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-talenthub-gray mb-2">
              Ofertas Verificadas
            </h3>
            <p className="text-gray-600">
              Todas las empresas y vacantes son verificadas para garantizar oportunidades reales.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-talenthub-blue text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-talenthub-gray mb-2">
              Transparencia Salarial
            </h3>
            <p className="text-gray-600">
              Conoce el rango salarial antes de aplicar. Sin sorpresas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-talenthub-blue text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-talenthub-gray mb-2">
              Estadísticas del Mercado
            </h3>
            <p className="text-gray-600">
              Accede a datos sobre salarios promedio y tendencias del sector TI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;