import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET contract by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const contrato = db.prepare('SELECT * FROM contratos WHERE id = ?').get(id);

  if (!contrato) {
    return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
  }

  return NextResponse.json(contrato);
}

// PUT update contract
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const data = await request.json();
  
  const { codigo_contrato, anualidad, denominacion, importe_sin_iva } = data;

  // Calculate IVA (21%)
  const importe_con_iva = Number((importe_sin_iva * 1.21).toFixed(2));

  try {
    const stmt = db.prepare(`
      UPDATE contratos 
      SET codigo_contrato = ?, anualidad = ?, denominacion = ?, importe_sin_iva = ?, importe_con_iva = ?
      WHERE id = ?
    `);

    stmt.run(codigo_contrato, anualidad, denominacion, importe_sin_iva, importe_con_iva, id);

    const updatedContract = db.prepare('SELECT * FROM contratos WHERE id = ?').get(id);
    return NextResponse.json(updatedContract);
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Ya existe un contrato con ese código.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE contract
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  try {
    db.prepare('DELETE FROM contratos WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
