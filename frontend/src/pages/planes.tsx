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

  const userType = localStorage.getItem("tipo");
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

  const comprarPlan = async (planId:number) => {

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

    <div style={{ padding:"60px 80px" }}>

      <h1 style={{
        textAlign:"center",
        fontSize:"34px",
        fontWeight:"700",
        marginBottom:"10px"
      }}>
        💳 Planes de Suscripción
      </h1>

      <p style={{
        textAlign:"center",
        color:"#666",
        marginBottom:"50px",
        fontSize:"18px"
      }}>
        Elige el plan que mejor se adapte a tus necesidades y potencia tu experiencia en TalentHub 🚀
      </p>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",
        gap:"30px"
      }}>

      {planes
      .filter(plan => plan.tipo_usuario === userType)
      .map(plan => {

        let emoji = "💼";
        let descripcion = "Plan ideal para comenzar";

        if(plan.nombre === "GRATIS"){
          emoji = "🚀";
          descripcion = "Empieza a explorar oportunidades tecnológicas";
        }

        if(plan.nombre === "PREMIUM"){
          emoji = "⭐";
          descripcion = "Maximiza tus oportunidades laborales";
        }

        if(plan.nombre === "PRO"){
          emoji = "⚡";
          descripcion = "Encuentra talento más rápido";
        }

        if(plan.nombre === "ENTERPRISE"){
          emoji = "👑";
          descripcion = "La solución completa para reclutamiento";
        }

        const esPlanActual = planActual === plan.nombre;

        return (

        <div
        key={plan.id}
        style={{
          background:"white",
          borderRadius:"16px",
          padding:"30px",
          boxShadow:"0 12px 30px rgba(0,0,0,0.08)",
          display:"flex",
          flexDirection:"column",
          justifyContent:"space-between",
          transition:"all .25s ease"
        }}
        onMouseEnter={(e)=>{
          e.currentTarget.style.transform="translateY(-6px)";
          e.currentTarget.style.boxShadow="0 18px 40px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e)=>{
          e.currentTarget.style.transform="translateY(0)";
          e.currentTarget.style.boxShadow="0 12px 30px rgba(0,0,0,0.08)";
        }}
        >

        {/* CONTENIDO */}

        <div>

        <h2 style={{
          fontSize:"22px",
          fontWeight:"600"
        }}>
          {emoji} {plan.nombre}
        </h2>

        <p style={{
          color:"#666",
          marginBottom:"15px"
        }}>
          {descripcion}
        </p>

        <p style={{
          fontSize:"32px",
          fontWeight:"700",
          color:"#2563eb",
          marginBottom:"20px"
        }}>
          ${plan.precio} MXN
        </p>

        <div style={{marginBottom:"20px"}}>

        {/* PREMIUM aspirante */}

        {plan.nombre === "PREMIUM" && plan.tipo_usuario === "aspirante" && (
          <p>♾️ Todo ilimitado</p>
        )}

        {plan.max_postulaciones_dia && (
          <p>📄 {plan.max_postulaciones_dia} postulaciones por día</p>
        )}

        {plan.max_candidatos && (
          <p>👥 Hasta {plan.max_candidatos} candidatos</p>
        )}

        <p>⚡ Plataforma rápida</p>
        <p>🔍 Acceso a oportunidades tecnológicas</p>

        </div>

        </div>

        {/* BOTON */}

        {esPlanActual ? (

          <button
          style={{
            width:"100%",
            padding:"12px",
            borderRadius:"10px",
            border:"none",
            background:"#16a34a",
            color:"white",
            fontWeight:"600"
          }}
          >
          ✅ Ya tienes este plan
          </button>

        ) : plan.precio === 0 ? (

          <button
          style={{
            width:"100%",
            padding:"12px",
            borderRadius:"10px",
            border:"1px solid #ddd",
            background:"#f3f4f6"
          }}
          >
          Plan gratuito
          </button>

        ) : (

          <button
          onClick={() => comprarPlan(plan.id)}
          style={{
            width:"100%",
            padding:"12px",
            borderRadius:"10px",
            border:"none",
            background:"#2563eb",
            color:"white",
            fontWeight:"600",
            cursor:"pointer"
          }}
          >
          💳 Comprar Plan
          </button>

        )}

        </div>

        )

      })}

      </div>

    </div>

  );

};

export default Planes;