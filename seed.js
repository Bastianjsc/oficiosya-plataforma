// backend/seed.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User.model'); 
const Solicitud = require('./src/models/solicitud.model'); // Añadimos el modelo de solicitudes

const comunasRM = [
  { nombre: 'Santiago', lat: -33.4372, lng: -70.6506 },
  { nombre: 'Providencia', lat: -33.4333, lng: -70.6167 },
  { nombre: 'Las Condes', lat: -33.4167, lng: -70.5833 },
  { nombre: 'Maipú', lat: -33.5167, lng: -70.7667 },
  { nombre: 'Puente Alto', lat: -33.6167, lng: -70.5833 },
  { nombre: 'La Florida', lat: -33.5167, lng: -70.5167 },
  { nombre: 'Ñuñoa', lat: -33.4500, lng: -70.6000 },
  { nombre: 'Estación Central', lat: -33.4667, lng: -70.7000 },
  { nombre: 'Macul', lat: -33.4833, lng: -70.6000 },
  { nombre: 'San Miguel', lat: -33.5000, lng: -70.6500 },
  { nombre: 'Quilicura', lat: -33.3667, lng: -70.7333 },
  { nombre: 'Recoleta', lat: -33.4000, lng: -70.6333 },
  { nombre: 'Peñalolén', lat: -33.4833, lng: -70.5333 }
];

const oficios = [
  'Gasfitería', 'Electricidad', 'Carpintería', 'Pintura', 'Cerrajería', 
  'Reparación de Electrodomésticos', 'Reparación de Computación y Celulares'
];

const nombresPrestadores = [
  'Juan Pérez', 'María González', 'Carlos Silva', 'Ana Rojas', 
  'Pedro Martínez', 'Laura Morales', 'Diego Tapia', 'Sofía Castro', 'Luis Soto'
];

// Comentarios predefinidos para darle realismo a las reseñas
const comentariosResenas = [
  "Excelente servicio, llegó a la hora acordada y solucionó el problema rápido.",
  "Muy profesional y ordenado. Lo recomiendo totalmente.",
  "El trabajo quedó impecable, aunque se demoró un poco más de lo previsto.",
  "Cobró exactamente lo del presupuesto, muy transparente y amable.",
  "100% recomendado. Dejó mi casa súper limpia después de trabajar."
];

const getRandomComunas = () => {
  const shuffled = [...comunasRM].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

const sembrarBaseDeDatos = async () => {
  try {
    console.log('⏳ Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a la base de datos.');

    // 1. CREAR CLIENTES DE PRUEBA (Para que puedan escribir las reseñas)
    console.log('🌱 Creando clientes de prueba para las reseñas...');
    const clientesGenerados = [];
    for (let i = 1; i <= 3; i++) {
      const emailCliente = `cliente_test${i}@mail.com`;
      let cliente = await User.findOne({ email: emailCliente });
      
      if (!cliente) {
        cliente = new User({
          nombre: `Cliente Prueba ${i}`,
          email: emailCliente,
          password: '123456',
          rol: 'Cliente'
        });
        await cliente.save();
      }
      clientesGenerados.push(cliente);
    }

    // 2. CREAR PRESTADORES Y SUS SOLICITUDES
    console.log('🌱 Insertando 9 prestadores simulados y generando sus reseñas reales...');
    
    for (let i = 1; i <= 9; i++) {
      const emailPrestador = `prestador${i}@mail.com`;
      let prestador = await User.findOne({ email: emailPrestador });

      if (!prestador) {
        const comunasAsignadas = getRandomComunas();
        const comunaPrincipal = comunasAsignadas[0];

        // Se crea el prestador con métricas en 0, luego se actualizan
        const nuevoPrestador = new User({
          nombre: nombresPrestadores[i - 1],
          email: emailPrestador,
          password: '123456',
          rol: 'Prestador',
          oficio: oficios[i % oficios.length],
          isVerified: true,
          tituloTienda: `Servicios Técnicos ${nombresPrestadores[i - 1].split(' ')[0]}`,
          biografia: `Soy ${nombresPrestadores[i - 1]}, especialista en ${oficios[i % oficios.length]} con experiencia comprobada. Trabajo rápido, limpio y garantizado.`,
          tarifaReferencia: `Evaluación desde $15.000`,
          tipoAtencion: 'Ambas',
          zonaCobertura: [comunasAsignadas[0].nombre, comunasAsignadas[1].nombre, comunasAsignadas[2].nombre],
          localesFisicos: [{
            nombreLocal: `Taller ${nombresPrestadores[i - 1].split(' ')[0]}`,
            direccion: 'Calle Ficticia',
            numero: `${Math.floor(Math.random() * 9000) + 1000}`,
            comuna: comunaPrincipal.nombre,
            ubicacion: { 
              type: 'Point', 
              coordinates: [
                comunaPrincipal.lng + (Math.random() - 0.5) * 0.02, 
                comunaPrincipal.lat + (Math.random() - 0.5) * 0.02
              ] 
            }
          }],
          calificacionPromedio: 0,
          numeroResenas: 0
        });

        await nuevoPrestador.save();
        prestador = nuevoPrestador;
        console.log(`✔️ Creado prestador: ${prestador.nombre}`);

        // 3. GENERAR RESEÑAS REALES (Solicitudes Finalizadas)
        // Cada prestador recibirá entre 2 y 4 reseñas de nuestros clientes de prueba
        const numResenas = Math.floor(Math.random() * 3) + 2; 
        let sumaEstrellas = 0;

        for (let j = 0; j < numResenas; j++) {
          const estrellasRandom = Math.floor(Math.random() * 2) + 4; // Genera 4 o 5 estrellas
          sumaEstrellas += estrellasRandom;
          const clienteRandom = clientesGenerados[j % clientesGenerados.length];
          const comentarioRandom = comentariosResenas[Math.floor(Math.random() * comentariosResenas.length)];

          await Solicitud.create({
            cliente: clienteRandom._id,
            prestador: prestador._id,
            descripcionCliente: `Necesitaba un servicio de ${prestador.oficio} en mi domicilio urgentemente.`,
            estado: 'Finalizado',
            presupuesto: {
              manoDeObra: 25000,
              materiales: 10000,
              mensajePrestador: "Diagnóstico y reparación completa en terreno."
            },
            calificacion: {
              estrellas: estrellasRandom,
              comentario: comentarioRandom,
              fecha: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Fechas pasadas aleatorias
            }
          });
        }

        // 4. ACTUALIZAR LAS MÉTRICAS DEL PRESTADOR EN BASE A LAS RESEÑAS CREADAS
        prestador.calificacionPromedio = (sumaEstrellas / numResenas).toFixed(1);
        prestador.numeroResenas = numResenas;
        await prestador.save();
        console.log(`   ↳ Agregadas ${numResenas} reseñas verificadas. Promedio: ${prestador.calificacionPromedio}`);

      } else {
        console.log(`⚠️ Omitido (ya existe): ${emailPrestador}`);
      }
    }

    console.log('🎉 Sembrado completado exitosamente con reseñas verificadas incluidas.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar la base de datos:', error);
    process.exit(1);
  }
};

sembrarBaseDeDatos();