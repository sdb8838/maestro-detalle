import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT NOT NULL,
    dni TEXT NOT NULL UNIQUE,
    direccion_calle TEXT NOT NULL,
    direccion_numero TEXT NOT NULL,
    direccion_piso TEXT,
    direccion_puerta TEXT,
    direccion_cp TEXT NOT NULL,
    direccion_localidad TEXT NOT NULL,
    direccion_provincia TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contratos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    codigo_contrato TEXT NOT NULL UNIQUE,
    anualidad INTEGER NOT NULL,
    denominacion TEXT NOT NULL,
    importe_sin_iva REAL NOT NULL,
    importe_con_iva REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
  );
`);

export default db;
