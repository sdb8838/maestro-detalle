import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET client by ID with contracts
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);

  if (!cliente) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  const contratos = db.prepare('SELECT * FROM contratos WHERE cliente_id = ? ORDER BY anualidad, codigo_contrato').all(id);

  return NextResponse.json({ ...cliente, contratos });
}

// PUT update client
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const data = await request.json();
  
  const { nombre, apellido, telefono, dni, direccion } = data;

  // Validate DNI
  const dniRegex = /^\d{8}[A-Z]$/;
  if (!dniRegex.test(dni)) {
    return NextResponse.json({ error: 'DNI inválido. Debe tener 8 dígitos seguidos de una letra mayúscula.' }, { status: 400 });
  }

  try {
    const stmt = db.prepare(`
      UPDATE clientes 
      SET nombre = ?, apellido = ?, telefono = ?, dni = ?,
          direccion_calle = ?, direccion_numero = ?, direccion_piso = ?, 
          direccion_puerta = ?, direccion_cp = ?, direccion_localidad = ?, direccion_provincia = ?
      WHERE id = ?
    `);

    stmt.run(
      nombre, apellido, telefono, dni,
      direccion.calle, direccion.numero, direccion.piso || '', direccion.puerta || '',
      direccion.cp, direccion.localidad, direccion.provincia,
      id
    );

    const updatedClient = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    return NextResponse.json(updatedClient);
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Ya existe un cliente con ese DNI.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE client
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  try {
    // Delete contracts first (cascading)
    db.prepare('DELETE FROM contratos WHERE cliente_id = ?').run(id);
    // Then delete client
    db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
