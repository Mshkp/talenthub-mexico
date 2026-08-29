import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { showSuccess, showError, showConfirm } from '../utils/alerts';

interface Plan {
  id: number;
  nombre: string;
  precio: number;
  tipo_usuario: string;
  max_postulaciones_dia?: number;
  max_candidatos?: number;
}

interface MiSuscripcion {
  plan: string;
  fecha_fin: string | null;
}

const Planes = () => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [miSuscripcion, setMiSuscripcion] = useState<MiSuscripcion | null>(null);

  const userType = localStorage.getItem("user_tipo");
  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarPlanes();
    if (token) {
      cargarMiSuscripcion();
    }
  }, [token]);

  const cargarPlanes = async () => {
    try {
      const res = await api.get('/planes/');
      setPlanes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarMiSuscripcion = async () => {
    try {
      const res = await api.get('/suscripcion/actual/');
      setMiSuscripcion(res.data);
    } catch (error) {
      console.error("Error al cargar la suscripción", error);
    }
  };

  const comprarPlan = (planId: number) => {
    if (!token) {
      showError("Para comprar un plan, primero debes iniciar sesión o registrarte", "¡Alto ahí!");
      return;
    }
    navigate(`/checkout/${planId}`);
  };

  const handleCancelarSuscripcion = async () => {
    const confirmado = await showConfirm(
      "¿Estás seguro de que deseas cancelar tu plan? Perderás tus beneficios Premium y regresarás al plan Gratuito de inmediato.", 
      "Cancelar Suscripción"
    );

    if (!confirmado) return;

    try {
      await api.post('/suscripcion/cancelar/');
      showSuccess("Tu suscripción ha sido cancelada.", "Plan Gratuito Activado");
      cargarMiSuscripcion(); // Recargamos para actualizar el banner
    } catch (error) {
      showError("No se pudo cancelar la suscripción", "Error");
    }
  };

  const planesEmpresa = planes.filter(p => p.tipo_usuario === 'empresa');
  const planesAspirante = planes.filter(p => p.tipo_usuario === 'aspirante');

  const renderTarjetas = (listaPlanes: Plan[]) => {
    return listaPlanes.map(plan => {
      let emoji = "💼";
      let descripcion = "Plan ideal para comenzar";

      if (plan.nombre === "GRATIS" || plan.nombre === "Gratis") {
        emoji = "🚀";
        descripcion = "Empieza a explorar oportunidades tecnológicas";
      }
      if (plan.nombre === "PREMIUM" || plan.nombre === "Premium") {
        emoji = "⭐";
        descripcion = "Maximiza tus oportunidades laborales";
      }
      if (plan.nombre === "PRO" || plan.nombre === "Pro") {
        emoji = "⚡";
        descripcion = "Encuentra talento más rápido";
      }
      if (plan.nombre === "ENTERPRISE" || plan.nombre === "Enterprise") {
        emoji = "👑";
        descripcion = "La solución completa para reclutamiento";
      }

      const esPlanActual = miSuscripcion?.plan.toLowerCase() === plan.nombre.toLowerCase() && token && userType === plan.tipo_usuario;

      return (
        <div
          key={plan.id}
          className="w-full max-w-sm mx-auto" 
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px 30px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "all .3s ease",
            border: plan.nombre.toUpperCase() === "PREMIUM" || plan.nombre.toUpperCase() === "PRO" ? "2px solid #2563eb" : "2px solid transparent",
            position: "relative"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)";
          }}
        >
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" }}>
              {emoji} {plan.nombre}
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "20px", lineHeight: "1.5" }}>
              {descripcion}
            </p>
            <p style={{ fontSize: "36px", fontWeight: "800", color: "#2563eb", marginBottom: "30px" }}>
              ${plan.precio} <span style={{fontSize:"16px", color:"#6b7280", fontWeight:"500"}}>MXN/mes</span>
            </p>

            <div style={{ marginBottom: "30px", color: "#4b5563", fontWeight: "500", lineHeight: "2" }}>
              {plan.nombre.toUpperCase() === "PREMIUM" && plan.tipo_usuario === "aspirante" && (
                <p>✨ Todo ilimitado</p>
              )}
              {plan.max_postulaciones_dia && (
                <p>📄 {plan.max_postulaciones_dia} postulaciones por día</p>
              )}
              {plan.max_candidatos && (
                <p>👥 Hasta {plan.max_candidatos} candidatos</p>
              )}
              <p>⚡ Plataforma rápida y segura</p>
              <p>🔍 Acceso a oportunidades de TI</p>
            </div>
          </div>

          {esPlanActual ? (
            <button
              style={{
                width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                background: "#10b981", color: "white", fontWeight: "700", fontSize: "16px",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
              }}
            >
              ✅ Tu plan actual
            </button>
          ) : parseFloat(plan.precio.toString()) === 0 ? (
            <button
              onClick={() => {
                if(!token) showError("Regístrate para obtener este plan", "Casi listo");
              }}
              style={{
                width: "100%", padding: "14px", borderRadius: "12px", border: "2px solid #e5e7eb",
                background: "#f9fafb", color: "#4b5563", fontWeight: "700", fontSize: "16px",
                cursor: token ? "default" : "pointer"
              }}
            >
              Plan Gratuito
            </button>
          ) : (
            <button
              onClick={() => comprarPlan(plan.id)}
              style={{
                width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                background: "#2563eb", color: "white", fontWeight: "700", fontSize: "16px",
                cursor: "pointer", boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                transition: "background .2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#1d4ed8"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#2563eb"}
            >
              💳 Comprar Plan
            </button>
          )}
        </div>
      );
    });
  };

  return (
    // CAMBIO AQUÍ: Usamos clases de Tailwind (px-4 py-12) en vez del padding fijo que rompía el móvil
    <div className="px-4 py-12 md:py-16 md:px-20" style={{ minHeight: "calc(100vh - 80px)", backgroundColor: "#f9fafb" }}>
      <h1 style={{ textAlign: "center", fontSize: "36px", fontWeight: "800", marginBottom: "10px", color: "#1f2937" }}>
        💳 Planes de Suscripción
      </h1>
      <p style={{ textAlign: "center", color: "#4b5563", marginBottom: "40px", fontSize: "18px", fontWeight: "500" }}>
        Elige el plan que mejor se adapte a tus necesidades y potencia tu experiencia en TalentHub 🚀
      </p>

      {token && miSuscripcion && (
        <div className="w-full mx-auto" style={{
          maxWidth: "800px", marginBottom: "40px", padding: "20px", 
          backgroundColor: miSuscripcion.plan.toUpperCase() === 'GRATIS' ? "#f3f4f6" : "#eff6ff",
          border: miSuscripcion.plan.toUpperCase() === 'GRATIS' ? "1px solid #d1d5db" : "2px solid #3b82f6",
          borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "10px"
        }}>
          <div>
            <h3 style={{fontSize: "20px", fontWeight: "bold", color: "#1f2937", margin: 0}}>
              Tu plan actual es: <span style={{color: "#2563eb"}}>{miSuscripcion.plan}</span>
            </h3>
            {miSuscripcion.fecha_fin && (
              <p style={{color: "#4b5563", marginTop: "4px", fontSize: "14px"}}>
                Válido hasta: {new Date(miSuscripcion.fecha_fin).toLocaleDateString('es-MX')}
              </p>
            )}
          </div>
          
          {miSuscripcion.plan.toUpperCase() !== 'GRATIS' && (
            <button 
              onClick={handleCancelarSuscripcion}
              style={{
                backgroundColor: "#ef4444", color: "white", border: "none", 
                padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", 
                cursor: "pointer", transition: "0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ef4444"}
            >
              Cancelar Suscripción
            </button>
          )}
        </div>
      )}

      {!userType ? (
        <>
          <h2 style={{textAlign: "center", fontSize: "28px", fontWeight: "700", color: "#374151", marginBottom: "30px", marginTop: "20px"}}>
            🏢 Para Empresas
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px", maxWidth: "1200px", margin: "0 auto" }}>
            {renderTarjetas(planesEmpresa)}
          </div>

          <h2 style={{textAlign: "center", fontSize: "28px", fontWeight: "700", color: "#374151", marginBottom: "30px", marginTop: "80px"}}>
            👨‍💻 Para Aspirantes
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px", maxWidth: "1200px", margin: "0 auto" }}>
            {renderTarjetas(planesAspirante)}
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px", maxWidth: "1200px", margin: "0 auto" }}>
          {renderTarjetas(userType === "empresa" ? planesEmpresa : planesAspirante)}
        </div>
      )}
    </div>
  );
};

export default Planes;