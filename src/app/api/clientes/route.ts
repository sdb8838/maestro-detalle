import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all clients
export async function GET() {
  const clientes = db.prepare('SELECT * FROM clientes ORDER BY apellido, nombre').all();
  return NextResponse.json(clientes);
}

// POST new client
export async function POST(request: NextRequest) {
  const data = await request.json();
  
  const { nombre, apellido, telefono, dni, direccion } = data;

  // Validate DNI (Spanish format)
  const dniRegex = /^\d{8}[A-Z]$/;
  if (!dniRegex.test(dni)) {
    return NextResponse.json({ error: 'DNI inválido. Debe tener 8 dígitos seguidos de una letra mayúscula.' }, { status: 400 });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO clientes (nombre, apellido, telefono, dni, direccion_calle, direccion_numero, direccion_piso, direccion_puerta, direccion_cp, direccion_localidad, direccion_provincia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      nombre, apellido, telefono, dni,
      direccion.calle, direccion.numero, direccion.piso || '', direccion.puerta || '',
      direccion.cp, direccion.localidad, direccion.provincia
    );

    const newClient = db.prepare('SELECT * FROM clientes WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(newClient, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Ya existe un cliente con ese DNI.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
