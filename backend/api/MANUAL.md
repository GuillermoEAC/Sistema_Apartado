# Manual de Usuario - Backend Sistema de Apartado

Este documento describe cómo configurar, ejecutar y probar la API en NestJS para el Sistema de Apartado de Salas de Cómputo.

---

## 🛠️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalados:

1. [Node.js](https://nodejs.org/) (versión 18 o superior)
2. [MySQL Server](https://dev.mysql.com/downloads/mysql/) (versión 8) o equivalente (XAMPP / WAMP)
3. Opcional: MySQL Workbench o DBeaver para ver la base de datos

---

## 🗄️ Configuración de la Base de Datos

1. Abre tu gestor de base de datos MySQL (Workbench, terminal, phpMyAdmin, etc).
2. Ejecuta el archivo SQL completo que genera las tablas:
   ```bash
   # Si usas terminal MySQL:
   mysql -u root -p < C:\Users\guill\OneDrive\Documentos\GitHub\Sistema_Apartado\backend\database\schema.sql
   ```
   > 📌 **¿Qué hace esto?**  
   > Crea la base de datos `sis_computo`, inserta las 7 relaciones requeridas (usuarios, solicitudes, reservas, etc) y crea datos iniciales (cuenta de admin y salas de cómputo por defecto).

## ⚙️ Configuración del Entorno (.env)

El archivo de entorno está en `backend/api/.env`. Ábrelo y revisa que las credenciales de tu base de datos sean correctas:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root      # ← Cambia si tu usuario MySQL no es root
DB_PASSWORD=          # ← Agrega tu contraseña de MySQL (vacio por defecto en XAMPP)
DB_DATABASE=sis_computo
```

---

## 🚀 Instalación y Ejecución

Abre una terminal directamente en la carpeta `backend/api`:

```powershell
cd C:\Users\guill\OneDrive\Documentos\GitHub\Sistema_Apartado\backend\api
```

### 1. Instalar dependencias
Todos los paquetes (TypeORM, JWT, bcryptjs, etc.) ya están configurados. Por si acaso, puedes volver a correr:
```bash
npm install
```

### 2. Ejecutar el servidor en modo desarrollo
Inicia la aplicación con auto-recarga (escucha cambios en los archivos):
```bash
npm run start:dev
```

Deberías ver un mensaje en la terminal parecido a este:
```
[NestApplication] Nest application successfully started
🚀 API: http://localhost:3000/api/v1
📚 Docs: http://localhost:3000/api/docs
```

---

## 📚 Documentación de la API (Swagger)

Una de las grandes ventajas de esta arquitectura es la auto-documentación.  
Con el servidor corriendo, abre en tu navegador:

👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

Esta interfaz interactiva web (Swagger) te permite ver todos los endpoints que he creado (auth, reservas, calendario, etc.) e interactuar con ellos sin necesidad de Postman.

---

## 🔐 ¿Cómo probarlo? Uso de Tokens (JWT)

### Paso 1: Obtener Token
1. En la página de Swagger (`/api/docs`), busca el endpoint **POST `/api/v1/auth/login`**.
2. Dale al botón "Try it out".
3. Pon las credenciales por defecto (creadas en el `schema.sql`):
   ```json
   {
     "correo": "admin@institucion.edu.mx",
     "password": "PLACEHOLDER_BCRYPT_HASH"
   }
   ```
   *(Nota: Actualmente el SQL usa un "placeholder", más adelante en la sección de Seeds veremos como arreglar la contraseña realista).*
4. Dale a **Execute**. El API te responderá con un campo `"access_token"`. Usa ese JWT.

### Paso 2: Usar las rutas protegidas
En la parte superior de Swagger hay un botón verde **`Authorize`**. Dale clic, pega el `access_token` ahí (sin la palabra Bearer) y dale a *Authorize*. ¡Listo! Ahora todos los endpoints que digan que requieren un rol de Admin o Profesor funcionarán.

---

## 🔧 Crear Primer Usuario Administrador (Seed de Contraseña)

En la base de datos SQL (`schema.sql`), creé un administrador básico pero su contraseña no tiene el "hash" de seguridad criptográfico real.

Puedes crear el hash real así. Crea un pequeño script temporal en la raíz de `backend/api` (ej. `hash.js`):

```javascript
// hash.js
const bcrypt = require('bcryptjs');
(async () => {
    // Generará el hash para la contraseña "admin123"
    const hash = await bcrypt.hash('admin123', 10);
    console.log("HASH A PEGAR EN BD:", hash);
})();
```

Córrelo en consola: `node hash.js`.
Copia el resultado (comenzará con `$2a$10$...`) y pégalo manualmente en la tabla `usuario` en la base de datos para el usuario `admin@institucion.edu.mx`. Ahora podrás hacer login con la password "admin123" real.

---

## 🌐 Conexión con Angular

Tu frontend Angular corre en el puerto 4200.  
El backend ya tiene configurado el **CORS** explícitamente en el archivo `main.ts` para aceptar peticiones desde `http://localhost:4200`. No tendrás bloqueos de orígenes cruzados.

Simplemente asegura que en tus servicos de Angular apuntes a `http://localhost:3000/api/v1`.

### Ejemplo en Angular:
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1/auth';

  constructor(private http: HttpClient) {}

  login(credenciales: LoginDto) {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }
}
```
