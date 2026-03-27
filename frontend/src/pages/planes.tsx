import React, { useEffect, useState } from "react";
import axios from "axios";

interface Plan {
  id: number;
  nombre: string;
  precio: number;
  tipo_usuario: string;
  max_postulaciones_dia?: number;
  max_candidatos?: number;
}

const Planes = () => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [planActual, setPlanActual] = useState<string>("GRATIS");

  // ¡CORREGIDO! Antes decía "tipo", ahora dice "user_tipo"
  const userType = localStorage.getItem("user_tipo");
  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/planes/");
      setPlanes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const comprarPlan = async (planId: number) => {
    if (!token) {
      alert("Debes iniciar sesión para comprar un plan 💳");
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/pago/crear/",
        { plan_id: planId },
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );
      console.log(res.data);
      alert("Orden de pago creada 💳");
    } catch (error) {
      console.error(error);
      alert("Error creando pago");
    }
  };

  return (
    <div style={{ padding: "60px 80px", minHeight: "calc(100vh - 80px)", backgroundColor: "#f9fafb" }}>
      <h1 style={{
        textAlign: "center",
        fontSize: "36px",
        fontWeight: "800",
        marginBottom: "10px",
        color: "#1f2937"
      }}>
        💳 Planes de Suscripción
      </h1>
      <p style={{
        textAlign: "center",
        color: "#4b5563",
        marginBottom: "50px",
        fontSize: "18px",
        fontWeight: "500"
      }}>
        Elige el plan que mejor se adapte a tus necesidades y potencia tu experiencia en TalentHub 🚀
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "30px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {planes
          // Si hay sesión activa, muestra solo los de ese rol. Si no hay sesión, muestra todos.
          .filter(plan => userType ? plan.tipo_usuario === userType : true)
          .map(plan => {
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

            const esPlanActual = planActual.toLowerCase() === plan.nombre.toLowerCase() && token;

            return (
              <div
                key={plan.id}
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
                {/* CONTENIDO */}
                <div>
                  <h2 style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#1f2937",
                    marginBottom: "8px"
                  }}>
                    {emoji} {plan.nombre}
                  </h2>
                  <p style={{
                    color: "#6b7280",
                    marginBottom: "20px",
                    lineHeight: "1.5"
                  }}>
                    {descripcion}
                  </p>
                  <p style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#2563eb",
                    marginBottom: "30px"
                  }}>
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

                {/* BOTON */}
                {esPlanActual ? (
                  <button
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#10b981",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "16px",
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
                    }}
                  >
                    ✅ Tu plan actual
                  </button>
                ) : parseFloat(plan.precio.toString()) === 0 ? (
                  <button
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                      background: "#f9fafb",
                      color: "#4b5563",
                      fontWeight: "700",
                      fontSize: "16px"
                    }}
                  >
                    Plan Gratuito
                  </button>
                ) : (
                  <button
                    onClick={() => comprarPlan(plan.id)}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "16px",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
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
          })}
      </div>
    </div>
  );
};

export default Planes;