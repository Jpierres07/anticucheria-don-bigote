const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'your_password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'BDAnticucheriaDonBigote',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: false, // For local dev
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise = null;
let useMock = false;

// Mock store in memory if database is not reachable locally
const mockDatabase = {
  usuarios: [
    { id_usuario: 1, username: 'norma.shuan', password_hash: '123456', id_personal: 1, id_cliente: null, estado: 1, rol: 'Administradora, Parrillera y Ventas', nombre_completo: 'Norma Shuan' },
    { id_usuario: 2, username: 'edgar.milla', password_hash: '123456', id_personal: 2, id_cliente: null, estado: 1, rol: 'Atención al Cliente y Limpieza', nombre_completo: 'Edgar Milla' },
    { id_usuario: 3, username: 'tania.espinoza', password_hash: '123456', id_personal: 3, id_cliente: null, estado: 1, rol: 'Atención al Cliente y Limpieza', nombre_completo: 'Tania Espinoza' },
    { id_usuario: 4, username: 'cliente.demo', password_hash: '123456', id_personal: null, id_cliente: 1, estado: 1, rol: 'Cliente', nombre_completo: 'Jean-Pierre Shuan' },
    { id_usuario: 5, username: 'jean.shuan', password_hash: '123456', id_personal: null, id_cliente: 1, estado: 1, rol: 'Cliente', nombre_completo: 'Jean-Pierre Shuan' },
    { id_usuario: 6, username: 'mario.fer', password_hash: '123456', id_personal: null, id_cliente: 27, estado: 1, rol: 'Cliente', nombre_completo: 'Mario Fernandez' },
    { id_usuario: 7, username: 'cliente.test509', password_hash: '123456', id_personal: null, id_cliente: 26, estado: 1, rol: 'Cliente', nombre_completo: 'Maria Lopez' }
  ],
  productos: [
    { id_producto: 1, nombre: 'Pollo a la Parrilla', precio: 16.00, id_categoria: 1, categoria: 'Platillos', imagen_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 2, nombre: 'Rachi Rachi', precio: 16.00, id_categoria: 1, categoria: 'Platillos', imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 3, nombre: 'Mollejitas', precio: 16.00, id_categoria: 1, categoria: 'Platillos', imagen_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 4, nombre: 'Alitas a la Parrilla', precio: 10.00, id_categoria: 1, categoria: 'Platillos', imagen_url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 5, nombre: 'Anticuchos de Corazón', precio: 12.00, id_categoria: 1, categoria: 'Platillos', imagen_url: 'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 6, nombre: 'Anticuchos de Pollo', precio: 6.00, id_categoria: 1, categoria: 'Platillos', imagen_url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 7, nombre: 'Anticuchos de Bofe', precio: 5.00, id_categoria: 1, categoria: 'Platillos', imagen_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 8, nombre: 'Porción de Patita', precio: 6.00, id_categoria: 1, categoria: 'Platillos', imagen_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 9, nombre: 'Porción de Chorizo', precio: 6.00, id_categoria: 1, categoria: 'Platillos', imagen_url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 10, nombre: 'Gaseosa personal 296 ml', precio: 3.00, id_categoria: 3, categoria: 'Bebidas', imagen_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 11, nombre: 'Gaseosa Gordita 625 ml', precio: 6.00, id_categoria: 3, categoria: 'Bebidas', imagen_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 12, nombre: 'Gaseosa 1 Litro', precio: 8.00, id_categoria: 3, categoria: 'Bebidas', imagen_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80' },
    { id_producto: 13, nombre: 'Chicha Morada 1 Litro', precio: 10.00, id_categoria: 3, categoria: 'Bebidas', imagen_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' }
  ],
  combos: [
    { 
      id_combo: 1, 
      nombre: 'Pollo a la Parrilla + Rachi', 
      descripcion: 'Jugoso pollo a la parrilla servido con porción generosa de rachi crujiente, papas doradas y ají macerado.', 
      precio_combo: 30.00, 
      imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id_combo: 2, 
      nombre: 'Rachi + Anticuchos de Pollo', 
      descripcion: 'Porción dorada de rachi acompañado de finos trozos de pollo a la parrilla en brocheta.', 
      precio_combo: 22.00, 
      imagen_url: 'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id_combo: 3, 
      nombre: 'Rachi + Anticuchos de Corazón', 
      descripcion: 'La combinación perfecta: Rachi crocante con brochetas tradicionales de corazón de res a la brasa.', 
      precio_combo: 28.00, 
      imagen_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id_combo: 4, 
      nombre: 'Rachi con Mollejita', 
      descripcion: 'Porción caliente y crujiente de rachi sazonado servido con sabrosas mollejitas a la parrilla.', 
      precio_combo: 15.00, 
      imagen_url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id_combo: 5, 
      nombre: 'Trío Parrillero Don Bigote', 
      descripcion: 'El gran especial de la casa: Brochetas de Pollo + Corazón de Res + Bofe con papas sancochadas y ají de choclo.', 
      precio_combo: 23.00, 
      imagen_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' 
    }
  ],
  mesas: [
    { id_mesa: 1, numero_mesa: 1, capacidad: 4, piso: 1, estado_mesa: 'Libre' },
    { id_mesa: 2, numero_mesa: 2, capacidad: 4, piso: 1, estado_mesa: 'Libre' },
    { id_mesa: 3, numero_mesa: 3, capacidad: 4, piso: 2, estado_mesa: 'Libre' },
    { id_mesa: 4, numero_mesa: 4, capacidad: 4, piso: 2, estado_mesa: 'Libre' },
    { id_mesa: 5, numero_mesa: 5, capacidad: 6, piso: 2, estado_mesa: 'Libre' },
    { id_mesa: 6, numero_mesa: 6, capacidad: 4, piso: 2, estado_mesa: 'Libre' },
    { id_mesa: 7, numero_mesa: 7, capacidad: 2, piso: 2, estado_mesa: 'Libre' }
  ],
  insumos: [
    { id_insumo: 1, nombre_insumo: 'Corazón de Res', unidad_compra: 'Kg', unidad_consumo: 'Porcion', factor_conversion: 5.00, stock_actual: 15.00, id_proveedor: 1, proveedor: 'Mercado Central de Huaraz' },
    { id_insumo: 2, nombre_insumo: 'Rachi (Pancita)', unidad_compra: 'Kg', unidad_consumo: 'Porcion', factor_conversion: 4.00, stock_actual: 20.00, id_proveedor: 1, proveedor: 'Mercado Central de Huaraz' },
    { id_insumo: 3, nombre_insumo: 'Pechuga de Pollo', unidad_compra: 'Kg', unidad_consumo: 'Porcion', factor_conversion: 4.00, stock_actual: 24.00, id_proveedor: 1, proveedor: 'Mercado Central de Huaraz' },
    { id_insumo: 4, nombre_insumo: 'Bofe de Res', unidad_compra: 'Kg', unidad_consumo: 'Porcion', factor_conversion: 4.00, stock_actual: 15.00, id_proveedor: 1, proveedor: 'Mercado Central de Huaraz' },
    { id_insumo: 5, nombre_insumo: 'Patitas de Pollo', unidad_compra: 'Kg', unidad_consumo: 'Porcion', factor_conversion: 5.00, stock_actual: 12.00, id_proveedor: 1, proveedor: 'Mercado Central de Huaraz' },
    { id_insumo: 6, nombre_insumo: 'Alitas de Pollo', unidad_compra: 'Kg', unidad_consumo: 'Porcion', factor_conversion: 6.00, stock_actual: 20.00, id_proveedor: 1, proveedor: 'Mercado Central de Huaraz' },
    { id_insumo: 7, nombre_insumo: 'Chorizo Parrillero', unidad_compra: 'Paquete (10u)', unidad_consumo: 'Porcion', factor_conversion: 10.00, stock_actual: 30.00, id_proveedor: 1, proveedor: 'Mercado Central de Huaraz' },
    { id_insumo: 8, nombre_insumo: 'Gas GLP 10Kg', unidad_compra: 'Balón', unidad_consumo: 'PorcionParrilla', factor_conversion: 100.00, stock_actual: 300.00, id_proveedor: 3, proveedor: 'SolGas / LlamaGas' }
  ],
  pedidos: [
    {
      id_pedido: 101,
      id_cliente: 1,
      cliente_nombre: 'Jean-Pierre Shuan',
      id_personal: 2,
      id_mesa: 2,
      numero_mesa: 2,
      fecha_pedido: new Date().toISOString(),
      total: 44.00,
      estado_pedido: 'Listo',
      tipo_servicio: 'Local',
      detalles: [
        { id_producto: 5, nombre: 'Anticuchos de Corazón', cantidad: 2, precio_unitario: 12.00 },
        { id_producto: 2, nombre: 'Rachi Rachi', cantidad: 1, precio_unitario: 16.00 }
      ]
    },
    {
      id_pedido: 102,
      id_cliente: 1,
      cliente_nombre: 'Mario Fernando',
      id_personal: 2,
      id_mesa: 4,
      numero_mesa: 4,
      fecha_pedido: new Date().toISOString(),
      total: 30.00,
      estado_pedido: 'Entregado',
      tipo_servicio: 'Local',
      detalles: [
        { id_combo: 1, nombre: 'Combo Pollo a la Parrilla + Rachi', cantidad: 1, precio_unitario: 30.00 }
      ]
    }
  ],
  reservas: [
    { id_reserva: 1, id_cliente: 1, cliente_nombre: 'Jean-Pierre Shuan', fecha_reserva: '2026-07-25', hora_reserva: '20:00', cantidad_personas: 6, tipo_evento: 'Cumpleaños', estado_reserva: 'Confirmada' }
  ],
  congeladora: [
    { id_cierre: 1, fecha_cierre: '2026-07-19', id_insumo: 1, insumo: 'Corazón de Res', cantidad_congelada: 12.0, observacion: 'Bandeja A1 congelada correctamente' }
  ]
};

const getPool = async () => {
  if (useMock) return null;
  if (!poolPromise) {
    try {
      poolPromise = sql.connect(dbConfig);
      const pool = await poolPromise;
      console.log('✅ Conectado exitosamente a SQL Server:', process.env.DB_DATABASE);
      return pool;
    } catch (err) {
      console.warn('⚠️ No se pudo conectar a SQL Server:', err.message);
      console.warn('⚡ Modo Fallback Activado: Ejecutando en Modo En Memoria (Mock Data).');
      useMock = true;
      return null;
    }
  }
  return poolPromise;
};

module.exports = {
  sql,
  getPool,
  isMock: () => useMock,
  mockDB: mockDatabase
};
