"use client";
import { useState, useEffect } from "react";

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  dni: string;
  direccion_calle: string;
  direccion_numero: string;
  direccion_piso: string;
  direccion_puerta: string;
  direccion_cp: string;
  direccion_localidad: string;
  direccion_provincia: string;
  contratos?: Contrato[];
}

interface Contrato {
  id: number;
  cliente_id: number;
  codigo_contrato: string;
  anualidad: number;
  denominacion: string;
  importe_sin_iva: number;
  importe_con_iva: number;
}

export default function Home() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarContratoForm, setMostrarContratoForm] = useState(false);
  const [editandoCliente, setEditandoCliente] = useState(false);
  const [editandoContrato, setEditandoContrato] = useState<Contrato | null>(null);
  const [error, setError] = useState("");
  const [contratoError, setContratoError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    nombre: "", apellido: "", telefono: "", dni: "",
    direccion: { calle: "", numero: "", piso: "", puerta: "", cp: "", localidad: "", provincia: "" }
  });

  // Contract form state
  const [contratoForm, setContratoForm] = useState({
    codigo_contrato: "", anualidad: new Date().getFullYear(), denominacion: "", importe_sin_iva: 0
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const seleccionarCliente = async (cliente: Cliente) => {
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`);
      const data = await res.json();
      setClienteSeleccionado(data);
    } catch (err) {
      console.error(err);
    }
  };

  const guardarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Error al guardar");
        return;
      }
      await cargarClientes();
      setMostrarFormulario(false);
      setFormData({ nombre: "", apellido: "", telefono: "", dni: "", direccion: { calle: "", numero: "", piso: "", puerta: "", cp: "", localidad: "", provincia: "" } });
    } catch (err) {
      setError("Error al guardar");
    }
  };

  const eliminarCliente = async (id: number) => {
    if (!confirm("¿Eliminar cliente y todos sus contratos?")) return;
    try {
      await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      setClienteSeleccionado(null);
      await cargarClientes();
    } catch (err) {
      console.error(err);
    }
  };

  const guardarContrato = async (e: React.FormEvent) => {
    e.preventDefault();
    setContratoError("");
    if (!clienteSeleccionado) return;
    try {
      const res = await fetch("/api/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contratoForm, cliente_id: clienteSeleccionado.id })
      });
      if (!res.ok) {
        const err = await res.json();
        setContratoError(err.error || "Error al guardar");
        return;
      }
      // Refresh client data
      const clienteRes = await fetch(`/api/clientes/${clienteSeleccionado.id}`);
      const clienteData = await clienteRes.json();
      setClienteSeleccionado(clienteData);
      setMostrarContratoForm(false);
      setContratoForm({ codigo_contrato: "", anualidad: new Date().getFullYear(), denominacion: "", importe_sin_iva: 0 });
    } catch (err) {
      setContratoError("Error al guardar");
    }
  };

  const eliminarContrato = async (id: number) => {
    if (!confirm("¿Eliminar contrato?")) return;
    if (!clienteSeleccionado) return;
    try {
      await fetch(`/api/contratos/${id}`, { method: "DELETE" });
      const clienteRes = await fetch(`/api/clientes/${clienteSeleccionado.id}`);
      const clienteData = await clienteRes.json();
      setClienteSeleccionado(clienteData);
    } catch (err) {
      console.error(err);
    }
  };

  // Editar cliente
  const iniciarEdicionCliente = () => {
    if (!clienteSeleccionado) return;
    setFormData({
      nombre: clienteSeleccionado.nombre,
      apellido: clienteSeleccionado.apellido,
      telefono: clienteSeleccionado.telefono,
      dni: clienteSeleccionado.dni,
      direccion: {
        calle: clienteSeleccionado.direccion_calle,
        numero: clienteSeleccionado.direccion_numero,
        piso: clienteSeleccionado.direccion_piso,
        puerta: clienteSeleccionado.direccion_puerta,
        cp: clienteSeleccionado.direccion_cp,
        localidad: clienteSeleccionado.direccion_localidad,
        provincia: clienteSeleccionado.direccion_provincia
      }
    });
    setEditandoCliente(true);
    setMostrarFormulario(true);
  };

  const actualizarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!clienteSeleccionado) return;
    try {
      const res = await fetch(`/api/clientes/${clienteSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Error al actualizar");
        return;
      }
      await cargarClientes();
      const clienteRes = await fetch(`/api/clientes/${clienteSeleccionado.id}`);
      const clienteData = await clienteRes.json();
      setClienteSeleccionado(clienteData);
      setMostrarFormulario(false);
      setEditandoCliente(false);
      setFormData({ nombre: "", apellido: "", telefono: "", dni: "", direccion: { calle: "", numero: "", piso: "", puerta: "", cp: "", localidad: "", provincia: "" } });
    } catch (err) {
      setError("Error al actualizar");
    }
  };

  // Editar contrato
  const iniciarEdicionContrato = (contrato: Contrato) => {
    setContratoForm({
      codigo_contrato: contrato.codigo_contrato,
      anualidad: contrato.anualidad,
      denominacion: contrato.denominacion,
      importe_sin_iva: contrato.importe_sin_iva
    });
    setEditandoContrato(contrato);
    setMostrarContratoForm(true);
  };

  const actualizarContrato = async (e: React.FormEvent) => {
    e.preventDefault();
    setContratoError("");
    if (!clienteSeleccionado || !editandoContrato) return;
    try {
      const res = await fetch(`/api/contratos/${editandoContrato.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contratoForm)
      });
      if (!res.ok) {
        const err = await res.json();
        setContratoError(err.error || "Error al actualizar");
        return;
      }
      const clienteRes = await fetch(`/api/clientes/${clienteSeleccionado.id}`);
      const clienteData = await clienteRes.json();
      setClienteSeleccionado(clienteData);
      setMostrarContratoForm(false);
      setEditandoContrato(null);
      setContratoForm({ codigo_contrato: "", anualidad: new Date().getFullYear(), denominacion: "", importe_sin_iva: 0 });
    } catch (err) {
      setContratoError("Error al actualizar");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header estilo Ayuntamiento de Murcia */}
      <header className="bg-gradient-to-r from-red-700 to-red-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 10 12 6.16-1.26 10-6.45 10-12V7l-10-5zm0 6c1.4 0 2.8 1.1 2.8 2.5V11c.6 0 1.2.6 1.2 1.2v3.5c0 .7-.5 1.3-1.2 1.3H9.2c-.7 0-1.2-.6-1.2-1.2v-3.5c0-.7.5-1.3 1.2-1.3V9.5C9.2 9.1 10.6 8 12 8zm0 1.5c-.8 0-1.3.5-1.3 1v1.5h2.6V9.5c0-.5-.5-1-1.3-1z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">Gestión de Clientes y Contratos</h1>
              <p className="text-red-200 text-sm">Administración Municipal</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-4 max-w-7xl mx-auto p-4">
        {/* Maestro - Lista de Clientes */}
        <div className="w-1/3 bg-white rounded-lg shadow-md border-t-4 border-red-700">
          <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Clientes
            </h2>
            <button onClick={() => setMostrarFormulario(true)} className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition-colors text-sm font-medium">Nuevo Cliente</button>
          </div>
          {mostrarFormulario && (
            <form onSubmit={editandoCliente ? actualizarCliente : guardarCliente} className="mb-4 p-3 bg-gray-50 rounded border">
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <input placeholder="Nombre" required className="w-full mb-2 p-2 border rounded" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <input placeholder="Apellido" required className="w-full mb-2 p-2 border rounded" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
              <input placeholder="Teléfono" required className="w-full mb-2 p-2 border rounded" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              <input placeholder="DNI (12345678A)" required className="w-full mb-2 p-2 border rounded" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
              <input placeholder="Calle" required className="w-full mb-2 p-2 border rounded" value={formData.direccion.calle} onChange={e => setFormData({...formData, direccion: {...formData.direccion, calle: e.target.value}})} />
              <div className="flex gap-2 mb-2">
                <input placeholder="Número" required className="w-1/3 p-2 border rounded" value={formData.direccion.numero} onChange={e => setFormData({...formData, direccion: {...formData.direccion, numero: e.target.value}})} />
                <input placeholder="Piso" className="w-1/3 p-2 border rounded" value={formData.direccion.piso} onChange={e => setFormData({...formData, direccion: {...formData.direccion, piso: e.target.value}})} />
                <input placeholder="Puerta" className="w-1/3 p-2 border rounded" value={formData.direccion.puerta} onChange={e => setFormData({...formData, direccion: {...formData.direccion, puerta: e.target.value}})} />
              </div>
              <div className="flex gap-2 mb-2">
                <input placeholder="CP" required className="w-1/3 p-2 border rounded" value={formData.direccion.cp} onChange={e => setFormData({...formData, direccion: {...formData.direccion, cp: e.target.value}})} />
                <input placeholder="Localidad" required className="w-2/3 p-2 border rounded" value={formData.direccion.localidad} onChange={e => setFormData({...formData, direccion: {...formData.direccion, localidad: e.target.value}})} />
              </div>
              <input placeholder="Provincia" required className="w-full mb-2 p-2 border rounded" value={formData.direccion.provincia} onChange={e => setFormData({...formData, direccion: {...formData.direccion, provincia: e.target.value}})} />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">{editandoCliente ? "Actualizar" : "Guardar"}</button>
                    <button type="button" onClick={() => { setMostrarFormulario(false); setEditandoCliente(false); }} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Cancelar</button>
                  </div>
            </form>
          )}
          <div className="max-h-[70vh] overflow-y-auto">
            {clientes.map(cliente => (
              <div key={cliente.id} onClick={() => seleccionarCliente(cliente)} className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${clienteSeleccionado?.id === cliente.id ? "bg-blue-100" : ""}`}>
                <p className="font-medium">{cliente.apellido}, {cliente.nombre}</p>
                <p className="text-sm text-gray-600">DNI: {cliente.dni}</p>
                <p className="text-sm text-gray-600">{cliente.direccion_calle} {cliente.direccion_numero}, {cliente.direccion_localidad}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle - Contratos del Cliente */}
        <div className="w-2/3 bg-white rounded-lg shadow-md border-t-4 border-red-700">
          {clienteSeleccionado ? (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{clienteSeleccionado.apellido}, {clienteSeleccionado.nombre}</h2>
                    <p className="text-gray-600">DNI: {clienteSeleccionado.dni} | Tel: {clienteSeleccionado.telefono}</p>
                    <p className="text-gray-600">{clienteSeleccionado.direccion_calle} {clienteSeleccionado.direccion_numero}, {clienteSeleccionado.direccion_piso}{clienteSeleccionado.direccion_puerta} - {clienteSeleccionado.direccion_cp} {clienteSeleccionado.direccion_localidad}, {clienteSeleccionado.direccion_provincia}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={iniciarEdicionCliente} className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">Editar</button>
                    <button onClick={() => eliminarCliente(clienteSeleccionado.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Eliminar</button>
                  </div>
                </div>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Contratos</h3>
                <button onClick={() => setMostrarContratoForm(true)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Nuevo Contrato</button>
              </div>
              {mostrarContratoForm && (
                <form onSubmit={editandoContrato ? actualizarContrato : guardarContrato} className="mb-4 p-3 bg-gray-50 rounded border">
                  {contratoError && <p className="text-red-500 text-sm mb-2">{contratoError}</p>}
                  <div className="flex gap-2 mb-2">
                    <input placeholder="Código Contrato" required className="flex-1 p-2 border rounded" value={contratoForm.codigo_contrato} onChange={e => setContratoForm({...contratoForm, codigo_contrato: e.target.value})} />
                    <input type="number" placeholder="Anualidad" required className="w-24 p-2 border rounded" value={contratoForm.anualidad} onChange={e => setContratoForm({...contratoForm, anualidad: parseInt(e.target.value)})} />
                  </div>
                  <input placeholder="Denominación" required className="w-full mb-2 p-2 border rounded" value={contratoForm.denominacion} onChange={e => setContratoForm({...contratoForm, denominacion: e.target.value})} />
                  <div className="flex gap-2 mb-2">
                    <input type="number" step="0.01" placeholder="Importe sin IVA" required className="flex-1 p-2 border rounded" value={contratoForm.importe_sin_iva} onChange={e => setContratoForm({...contratoForm, importe_sin_iva: parseFloat(e.target.value)})} />
                    <span className="flex items-center bg-gray-200 px-3 rounded">+ IVA 21% = €{(contratoForm.importe_sin_iva * 1.21).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">{editandoContrato ? "Actualizar" : "Guardar"}</button>
                    <button type="button" onClick={() => { setMostrarContratoForm(false); setEditandoContrato(null); }} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Cancelar</button>
                  </div>
                </form>
              )}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Código</th>
                    <th className="border p-2 text-left">Año</th>
                    <th className="border p-2 text-left">Denominación</th>
                    <th className="border p-2 text-right">Sin IVA</th>
                    <th className="border p-2 text-right">Con IVA</th>
                    <th className="border p-2 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {clienteSeleccionado.contratos?.map(contrato => (
                    <tr key={contrato.id} className="hover:bg-gray-50">
                      <td className="border p-2">{contrato.codigo_contrato}</td>
                      <td className="border p-2">{contrato.anualidad}</td>
                      <td className="border p-2">{contrato.denominacion}</td>
                      <td className="border p-2 text-right">€{contrato.importe_sin_iva.toFixed(2)}</td>
                      <td className="border p-2 text-right font-medium">€{contrato.importe_con_iva.toFixed(2)}</td>
                      <td className="border p-2 text-center">
                        <button onClick={() => iniciarEdicionContrato(contrato)} className="text-yellow-600 hover:text-yellow-800 mr-2">Editar</button>
                        <button onClick={() => eliminarContrato(contrato.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!clienteSeleccionado.contratos || clienteSeleccionado.contratos.length === 0) && (
                <p className="text-center text-gray-500 py-8">Este cliente no tiene contratos</p>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Seleccione un cliente para ver sus contratos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
