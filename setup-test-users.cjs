/**
 * Script para configurar usuarios de prueba
 * NO afecta el sistema existente
 */
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBJiXU5fV9hMnntRQ-Tw-W4OpoL3ofXioU",
  authDomain: "cotizador-bls.firebaseapp.com",
  projectId: "cotizador-bls",
  storageBucket: "cotizador-bls.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupTestUsers() {
  console.log("👥 Configurando usuarios de prueba...");
  console.log("=====================================");

  const usuariosPrueba = [
    {
      id: "user_admin",
      nombre: "Fernando Russo",
      email: "russofg@gmail.com",
      rol: "admin",
      activo: true,
      notificacionesEmail: true,
      notificacionesPush: true,
      departamento: "Administración",
      telefono: "+54 9 11 1234-5678",
    },
    {
      id: "user_vendedor",
      nombre: "María González",
      email: "maria@serviciosbls.com",
      rol: "usuario",
      activo: true,
      notificacionesEmail: true,
      notificacionesPush: true,
      departamento: "Ventas",
      telefono: "+54 9 11 2345-6789",
    },
    {
      id: "user_operaciones",
      nombre: "Carlos López",
      email: "carlos@serviciosbls.com",
      rol: "usuario",
      activo: true,
      notificacionesEmail: true,
      notificacionesPush: false,
      departamento: "Operaciones",
      telefono: "+54 9 11 3456-7890",
    },
    {
      id: "user_cliente",
      nombre: "Ana Martínez",
      email: "ana.martinez@empresa.com",
      rol: "cliente",
      activo: true,
      notificacionesEmail: true,
      notificacionesPush: false,
      departamento: "Cliente",
      telefono: "+54 9 11 4567-8901",
    },
  ];

  try {
    for (const usuario of usuariosPrueba) {
      const userRef = doc(db, "usuarios", usuario.id);
      await setDoc(userRef, {
        ...usuario,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Usuario creado: ${usuario.nombre} (${usuario.email})`);
    }

    console.log("\n🎉 Usuarios de prueba configurados exitosamente");
    console.log("\n📋 Usuarios disponibles:");
    usuariosPrueba.forEach((usuario, index) => {
      console.log(`   ${index + 1}. ${usuario.nombre}`);
      console.log(`      Email: ${usuario.email}`);
      console.log(`      Rol: ${usuario.rol}`);
      console.log(`      Departamento: ${usuario.departamento}`);
      console.log(
        `      Notificaciones Email: ${usuario.notificacionesEmail ? "✅" : "❌"}`
      );
      console.log("");
    });

    console.log(
      "💡 Ahora puedes probar el sistema con múltiples destinatarios"
    );
  } catch (error) {
    console.error("❌ Error configurando usuarios:", error);
  }
}

setupTestUsers();
