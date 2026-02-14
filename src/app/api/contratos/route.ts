import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all contracts for a client
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clienteId = searchParams.get('cliente_id');

  if (!clienteId) {
    return NextResponse.json({ error: 'cliente_id es requerido' }, { status: 400 });
  }

  const contratos = db.prepare('SELECT * FROM contratos WHERE cliente_id = ? ORDER BY anualidad, codigo_contrato').all(clienteId);
  return NextResponse.json(contratos);
}

// POST new contract
export async function POST(request: NextRequest) {
  const data = await request.json();
  
  const { cliente_id, codigo_contrato, anualidad, denominacion, importe_sin_iva } = data;

  // Calculate IVA (21%)
  const importe_con_iva = Number((importe_sin_iva * 1.21).toFixed(2));

  try {
    const stmt = db.prepare(`
      INSERT INTO contratos (cliente_id, codigo_contrato, anualidad, denominacion, importe_sin_iva, importe_con_iva)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(cliente_id, codigo_contrato, anualidad, denominacion, importe_sin_iva, importe_con_iva);

    const newContract = db.prepare('SELECT * FROM contratos WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(newContract, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Ya existe un contrato con ese código.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
