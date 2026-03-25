/**
 * Servicio para gestionar usuarios y sus emails
 * Permite configurar múltiples destinatarios para recordatorios
 */
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
} = require("firebase/firestore");

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

class UserManagementService {
  static COLLECTION_NAME = "usuarios";

  /**
   * Obtiene todos los usuarios activos
   */
  static async getActiveUsers() {
    try {
      const usuariosRef = collection(db, this.COLLECTION_NAME);
      const q = query(usuariosRef, orderBy("nombre"));
      const snapshot = await getDocs(q);

      const usuarios = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.activo !== false) {
          usuarios.push({
            id: doc.id,
            nombre: data.nombre || "",
            email: data.email || "",
            rol: data.rol || "usuario",
            activo: data.activo !== false,
            avatar: data.avatar,
            telefono: data.telefono,
            departamento: data.departamento,
            notificacionesEmail: data.notificacionesEmail !== false,
            notificacionesPush: data.notificacionesPush !== false,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        }
      });

      return usuarios;
    } catch (error) {
      console.error("Error obteniendo usuarios activos:", error);
      return [];
    }
  }

  /**
   * Obtiene usuarios que pueden recibir notificaciones por email
   */
  static async getEmailNotificationUsers() {
    try {
      const usuarios = await this.getActiveUsers();
      return usuarios.filter(
        (usuario) =>
          usuario.notificacionesEmail &&
          usuario.email &&
          usuario.email.trim() !== ""
      );
    } catch (error) {
      console.error("Error obteniendo usuarios para notificaciones:", error);
      return [];
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  static async getUserById(userId) {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION_NAME, userId));
      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return {
        id: userDoc.id,
        nombre: data.nombre || "",
        email: data.email || "",
        rol: data.rol || "usuario",
        activo: data.activo !== false,
        avatar: data.avatar,
        telefono: data.telefono,
        departamento: data.departamento,
        notificacionesEmail: data.notificacionesEmail !== false,
        notificacionesPush: data.notificacionesPush !== false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error obteniendo usuario por ID:", error);
      return null;
    }
  }

  /**
   * Obtiene el email del usuario actual (para compatibilidad con el sistema existente)
   */
  static async getCurrentUserEmail() {
    try {
      // Por ahora retornamos el email hardcodeado para mantener compatibilidad
      // En el futuro esto debería obtener el usuario actual logueado
      return "russofg@gmail.com";
    } catch (error) {
      console.error("Error obteniendo email del usuario actual:", error);
      return "russofg@gmail.com";
    }
  }
}

module.exports = { UserManagementService };
