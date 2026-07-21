-- =========================================================================================
-- PROYECTO: SISTEMA INTEGRAL RESTAURANTE - ANTICUCHERÍA DON BIGOTE
-- CURSO: SISTEMAS ÁGILES | VI CICLO - UNASAM
-- DOCENTE: M.Sc. Grimaldo Mejía
-- AUTOR: Jean-Pierre Shuan
-- FECHA: 2026-07-20
-- DESCRIPCIÓN: SCRIPT DDL Y DML COMPLETO EN TERCERA FORMA NORMAL (3FN)
-- =========================================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'BDAnticucheriaDonBigote')
BEGIN
    CREATE DATABASE BDAnticucheriaDonBigote;
END
GO

USE BDAnticucheriaDonBigote;
GO

-- =========================================================================================
-- 1. TABLA: Cargo (Personal)
-- =========================================================================================
IF OBJECT_ID('dbo.Cargo', 'U') IS NOT NULL DROP TABLE dbo.Cargo;
CREATE TABLE dbo.Cargo (
    id_cargo INT IDENTITY(1,1) PRIMARY KEY,
    nombre_cargo VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
);

-- =========================================================================================
-- 2. TABLA: Personal (Trabajadores)
-- =========================================================================================
IF OBJECT_ID('dbo.Personal', 'U') IS NOT NULL DROP TABLE dbo.Personal;
CREATE TABLE dbo.Personal (
    id_personal INT IDENTITY(1,1) PRIMARY KEY,
    dni VARCHAR(8) NOT NULL UNIQUE CONSTRAINT UQ_Personal_DNI,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(15) NULL,
    fecha_contratacion DATETIME DEFAULT GETDATE(),
    sueldo DECIMAL(10,2) NOT NULL CONSTRAINT CK_Personal_Sueldo CHECK (sueldo > 0),
    id_cargo INT NOT NULL CONSTRAINT FK_Personal_Cargo FOREIGN KEY REFERENCES dbo.Cargo(id_cargo),
    estado VARCHAR(20) DEFAULT 'Activo' CONSTRAINT CK_Personal_Estado CHECK (estado IN ('Activo', 'Inactivo'))
);

-- =========================================================================================
-- 3. TABLA: Cliente
-- =========================================================================================
IF OBJECT_ID('dbo.Cliente', 'U') IS NOT NULL DROP TABLE dbo.Cliente;
CREATE TABLE dbo.Cliente (
    id_cliente INT IDENTITY(1,1) PRIMARY KEY,
    dni VARCHAR(8) NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NULL,
    telefono VARCHAR(15) NULL
);

-- =========================================================================================
-- 4. TABLA: Usuario (Autenticación y Roles RBAC)
-- =========================================================================================
IF OBJECT_ID('dbo.Usuario', 'U') IS NOT NULL DROP TABLE dbo.Usuario;
CREATE TABLE dbo.Usuario (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE CONSTRAINT UQ_Usuario_Username,
    password_hash VARCHAR(255) NOT NULL,
    id_personal INT NULL CONSTRAINT FK_Usuario_Personal FOREIGN KEY REFERENCES dbo.Personal(id_personal),
    id_cliente INT NULL CONSTRAINT FK_Usuario_Cliente FOREIGN KEY REFERENCES dbo.Cliente(id_cliente),
    estado BIT DEFAULT 1, -- 1 = Activo / Aprobado, 0 = Pendiente de Aprobación
    CONSTRAINT CK_Usuario_Exclusividad CHECK (
        (id_personal IS NOT NULL AND id_cliente IS NULL) OR 
        (id_personal IS NULL AND id_cliente IS NOT NULL)
    )
);

-- =========================================================================================
-- 5. TABLA: Categoria (Platillos / Bebidas)
-- =========================================================================================
IF OBJECT_ID('dbo.Categoria', 'U') IS NOT NULL DROP TABLE dbo.Categoria;
CREATE TABLE dbo.Categoria (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- =========================================================================================
-- 6. TABLA: Producto (Carta Digital)
-- =========================================================================================
IF OBJECT_ID('dbo.Producto', 'U') IS NOT NULL DROP TABLE dbo.Producto;
CREATE TABLE dbo.Producto (
    id_producto INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    precio DECIMAL(10,2) NOT NULL CONSTRAINT CK_Producto_Precio CHECK (precio >= 0),
    id_categoria INT NOT NULL CONSTRAINT FK_Producto_Categoria FOREIGN KEY REFERENCES dbo.Categoria(id_categoria),
    imagen_url VARCHAR(500) NULL
);

-- =========================================================================================
-- 7. TABLA: Combo
-- =========================================================================================
IF OBJECT_ID('dbo.Combo', 'U') IS NOT NULL DROP TABLE dbo.Combo;
CREATE TABLE dbo.Combo (
    id_combo INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    precio_combo DECIMAL(10,2) NOT NULL CONSTRAINT CK_Combo_Precio CHECK (precio_combo >= 0)
);

-- =========================================================================================
-- 8. TABLA: Mesa (Mapa de Salón por Pisos)
-- =========================================================================================
IF OBJECT_ID('dbo.Mesa', 'U') IS NOT NULL DROP TABLE dbo.Mesa;
CREATE TABLE dbo.Mesa (
    id_mesa INT IDENTITY(1,1) PRIMARY KEY,
    numero_mesa INT NOT NULL UNIQUE,
    capacidad INT NOT NULL CONSTRAINT CK_Mesa_Capacidad CHECK (capacidad > 0),
    piso INT NOT NULL CONSTRAINT CK_Mesa_Piso CHECK (piso IN (1, 2)),
    estado_mesa VARCHAR(20) DEFAULT 'Libre' CONSTRAINT CK_Mesa_Estado CHECK (estado_mesa IN ('Libre', 'Ocupada', 'Reservada'))
);

-- =========================================================================================
-- 9. TABLA: Proveedor (Mercado Central / Distribuidores)
-- =========================================================================================
IF OBJECT_ID('dbo.Proveedor', 'U') IS NOT NULL DROP TABLE dbo.Proveedor;
CREATE TABLE dbo.Proveedor (
    id_proveedor INT IDENTITY(1,1) PRIMARY KEY,
    nombre_proveedor VARCHAR(100) NOT NULL,
    contacto VARCHAR(100) NULL,
    telefono VARCHAR(15) NULL
);

-- =========================================================================================
-- 10. TABLA: Insumo (Logística 3FN con Factor de Conversión)
-- =========================================================================================
IF OBJECT_ID('dbo.Insumo', 'U') IS NOT NULL DROP TABLE dbo.Insumo;
CREATE TABLE dbo.Insumo (
    id_insumo INT IDENTITY(1,1) PRIMARY KEY,
    nombre_insumo VARCHAR(100) NOT NULL,
    unidad_compra VARCHAR(20) NOT NULL, -- Kg, Balón, Caja
    unidad_consumo VARCHAR(20) NOT NULL, -- Porcion, PorcionParrilla, Unidad
    factor_conversion DECIMAL(10,2) NOT NULL DEFAULT 1.00, -- Ejemplo: 1 Kg = 5 Porciones
    stock_actual DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    id_proveedor INT NULL CONSTRAINT FK_Insumo_Proveedor FOREIGN KEY REFERENCES dbo.Proveedor(id_proveedor)
);

-- =========================================================================================
-- 11. TABLA: CompraInsumo (Abastecimiento)
-- =========================================================================================
IF OBJECT_ID('dbo.CompraInsumo', 'U') IS NOT NULL DROP TABLE dbo.CompraInsumo;
CREATE TABLE dbo.CompraInsumo (
    id_compra INT IDENTITY(1,1) PRIMARY KEY,
    id_insumo INT NOT NULL CONSTRAINT FK_Compra_Insumo FOREIGN KEY REFERENCES dbo.Insumo(id_insumo),
    id_personal INT NULL CONSTRAINT FK_Compra_Personal FOREIGN KEY REFERENCES dbo.Personal(id_personal),
    cantidad_comprada DECIMAL(10,2) NOT NULL CHECK (cantidad_comprada > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    fecha_compra DATETIME DEFAULT GETDATE()
);

-- =========================================================================================
-- 12. TABLA: Pedido (Ventas / Comandas)
-- =========================================================================================
IF OBJECT_ID('dbo.Pedido', 'U') IS NOT NULL DROP TABLE dbo.Pedido;
CREATE TABLE dbo.Pedido (
    id_pedido INT IDENTITY(1,1) PRIMARY KEY,
    id_cliente INT NULL CONSTRAINT FK_Pedido_Cliente FOREIGN KEY REFERENCES dbo.Cliente(id_cliente),
    id_personal INT NULL CONSTRAINT FK_Pedido_Personal FOREIGN KEY REFERENCES dbo.Personal(id_personal),
    id_mesa INT NULL CONSTRAINT FK_Pedido_Mesa FOREIGN KEY REFERENCES dbo.Mesa(id_mesa),
    fecha_pedido DATETIME DEFAULT GETDATE(),
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado_pedido VARCHAR(30) DEFAULT 'En Proceso' CONSTRAINT CK_Pedido_Estado CHECK (estado_pedido IN ('En Proceso', 'En Parrilla', 'Listo', 'Entregado', 'Cancelado')),
    tipo_servicio VARCHAR(20) DEFAULT 'Local' CONSTRAINT CK_Pedido_Tipo CHECK (tipo_servicio IN ('Local', 'Llevar'))
);

-- =========================================================================================
-- 13. TABLA: DetallePedido
-- =========================================================================================
IF OBJECT_ID('dbo.DetallePedido', 'U') IS NOT NULL DROP TABLE dbo.DetallePedido;
CREATE TABLE dbo.DetallePedido (
    id_detalle INT IDENTITY(1,1) PRIMARY KEY,
    id_pedido INT NOT NULL CONSTRAINT FK_Detalle_Pedido FOREIGN KEY REFERENCES dbo.Pedido(id_pedido) ON DELETE CASCADE,
    id_producto INT NULL CONSTRAINT FK_Detalle_Producto FOREIGN KEY REFERENCES dbo.Producto(id_producto),
    id_combo INT NULL CONSTRAINT FK_Detalle_Combo FOREIGN KEY REFERENCES dbo.Combo(id_combo),
    cantidad INT NOT NULL CONSTRAINT CK_Detalle_Cantidad CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL
);

-- =========================================================================================
-- 14. TABLA: Reserva (Mesas / Eventos)
-- =========================================================================================
IF OBJECT_ID('dbo.Reserva', 'U') IS NOT NULL DROP TABLE dbo.Reserva;
CREATE TABLE dbo.Reserva (
    id_reserva INT IDENTITY(1,1) PRIMARY KEY,
    id_cliente INT NOT NULL CONSTRAINT FK_Reserva_Cliente FOREIGN KEY REFERENCES dbo.Cliente(id_cliente),
    fecha_reserva DATE NOT NULL,
    hora_reserva VARCHAR(10) NOT NULL,
    cantidad_personas INT NOT NULL CHECK (cantidad_personas > 0),
    tipo_evento VARCHAR(50) DEFAULT 'Atencion en Local',
    estado_reserva VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado_reserva IN ('Pendiente', 'Confirmada', 'Cancelada'))
);

-- =========================================================================================
-- 15. TABLA: CierreCongeladora (Mermas Nocturnas)
-- =========================================================================================
IF OBJECT_ID('dbo.CierreCongeladora', 'U') IS NOT NULL DROP TABLE dbo.CierreCongeladora;
CREATE TABLE dbo.CierreCongeladora (
    id_cierre INT IDENTITY(1,1) PRIMARY KEY,
    fecha_cierre DATE DEFAULT GETDATE(),
    id_insumo INT NOT NULL CONSTRAINT FK_Cierre_Insumo FOREIGN KEY REFERENCES dbo.Insumo(id_insumo),
    cantidad_congelada DECIMAL(10,2) NOT NULL,
    observacion VARCHAR(255) NULL
);
GO

-- =========================================================================================
-- DATOS SEMILLA E INSERCIÓN DE PRUEBA (DML)
-- =========================================================================================

-- Cargos
INSERT INTO dbo.Cargo (nombre_cargo, descripcion) VALUES
('Administradora, Parrillera y Ventas', 'Sra. Norma Shuan - Gestión Total y Control de Brasa'),
('Atención al Cliente y Limpieza', 'Edgar Milla & Tania Espinoza - Mozos de Salón');

-- Personal
INSERT INTO dbo.Personal (dni, nombre, apellido, telefono, sueldo, id_cargo, estado) VALUES
('10000001', 'Norma', 'Shuan Lliuya', '989842108', 2800.00, 1, 'Activo'),
('10000002', 'Edgar', 'Milla Pajuelo', '916694029', 2000.00, 2, 'Activo'),
('10000003', 'Tania', 'Espinoza Shuan', '916694029', 1800.00, 2, 'Activo');

-- Cliente Demo
INSERT INTO dbo.Cliente (dni, nombre, apellido, telefono) VALUES
('71234567', 'Jean-Pierre', 'Shuan', '987654321');

-- Usuarios (Password default: '123456' en hash bcrypt)
INSERT INTO dbo.Usuario (username, password_hash, id_personal, id_cliente, estado) VALUES
('norma.shuan', '$2a$12$e83h4k92m1n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i', 1, NULL, 1),
('edgar.milla', '$2a$12$k83j2m1n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j', 2, NULL, 1),
('tania.espinoza', '$2a$12$m93l1n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k', 3, NULL, 1),
('cliente.demo', '$2a$12$e83h4k92m1n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i', NULL, 1, 1);

-- Categorías
INSERT INTO dbo.Categoria (nombre) VALUES ('Platillos'), ('Combos'), ('Bebidas');

-- Productos con Fotos
INSERT INTO dbo.Producto (nombre, descripcion, precio, id_categoria, imagen_url) VALUES
('Pollo a la Parrilla', 'Pollo a la brasa con papas doradas', 16.00, 1, '/img/parrilla.jpg'),
('Rachi Rachi', 'Rachi de pancita tradicional con choclo', 16.00, 1, '/img/rachi.jpg'),
('Mollejitas', 'Porción de mollejitas a la parrilla', 16.00, 1, '/img/mollejitas.jpg'),
('Alitas a la Parilla', 'Alitas sazonadas con ají panca', 10.00, 1, '/img/alitas.jpg'),
('Anticuchos de Corazón', 'Corazón de res marinado al carbón', 12.00, 1, '/img/corazon.jpg'),
('Anticuchos de Pollo', 'Palitos de anticucho de pollo jugoso', 6.00, 1, '/img/corazon.jpg'),
('Anticuchos de Bofe', 'Bofe a la parrilla huaracino', 5.00, 1, '/img/corazon.jpg'),
('Porción de Patita', 'Patita sazonada a la parrilla', 6.00, 1, '/img/parrilla.jpg'),
('Porción de Chorizo', 'Chorizo parrillero crujiente', 6.00, 1, '/img/parrilla.jpg'),
('Gaseosa personal 296 ml', 'Inca Kola o Coca Cola helada', 3.00, 3, '/img/chicha.jpg'),
('Gaseosa Gordita 625 ml', 'Gaseosa tamaño mediano', 6.00, 3, '/img/chicha.jpg'),
('Gaseosa 1 Litro', 'Gaseosa familiar 1 Litro', 8.00, 3, '/img/chicha.jpg'),
('Chicha Morada 1 Litro', 'Chicha morada natural de la casa', 10.00, 3, '/img/chicha.jpg');

-- Combos
INSERT INTO dbo.Combo (nombre, descripcion, precio_combo) VALUES
('Pollo a la Parrilla + Rachi', 'Pollo a la parrilla servido con porción de rachi tradicional', 30.00),
('Rachi + Anticuchos de Pollo', 'Porción de rachi acompañado de anticuchos de pollo', 22.00),
('Rachi + Anticuchos de Corazón', 'Porción de rachi con anticuchos de corazón', 28.00),
('Rachi con Mollejita', 'Porción combinada de rachi con mollejitas', 15.00),
('Trío Parrillero Don Bigote', 'Anticuchos de Pollo + Corazón + Bofe', 23.00);

-- Mesas Salón
INSERT INTO dbo.Mesa (numero_mesa, capacidad, piso, estado_mesa) VALUES
(1, 4, 1, 'Libre'),
(2, 4, 1, 'Libre'),
(3, 4, 2, 'Libre'),
(4, 4, 2, 'Libre'),
(5, 6, 2, 'Libre'),
(6, 4, 2, 'Libre'),
(7, 2, 2, 'Libre');

-- Proveedores e Insumos
INSERT INTO dbo.Proveedor (nombre_proveedor, contacto, telefono) VALUES
('Mercado Central de Huaraz', 'Sr. Luis', '943000111'),
('SolGas / LlamaGas Huaraz', 'Distribuidora Sol', '043-421100');

INSERT INTO dbo.Insumo (nombre_insumo, unidad_compra, unidad_consumo, factor_conversion, stock_actual, id_proveedor) VALUES
('Corazón de Res', 'Kg', 'Porcion', 5.00, 25.00, 1),
('Rachi (Pancita)', 'Kg', 'Porcion', 4.00, 20.00, 1),
('Pechuga de Pollo', 'Kg', 'Porcion', 4.00, 30.00, 1),
('Gas GLP 45Kg', 'Balón', 'PorcionParrilla', 450.00, 900.00, 2);

PRINT '=========================================================';
PRINT '  SCRIPT DDL Y DML EJECUTADO CON ÉXITO - DON BIGOTE';
PRINT '=========================================================';
GO
