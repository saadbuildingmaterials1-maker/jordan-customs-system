-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  companyName VARCHAR(255) NOT NULL,
  contactPerson VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  country VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT
);

-- Create supplierPayments table
CREATE TABLE IF NOT EXISTS supplierPayments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplierId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'JOD',
  paymentDate BIGINT NOT NULL,
  paymentMethod VARCHAR(50),
  reference VARCHAR(255),
  notes TEXT,
  createdAt BIGINT NOT NULL
);

-- Create supplierItems table
CREATE TABLE IF NOT EXISTS supplierItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplierId INT NOT NULL,
  itemName VARCHAR(255) NOT NULL,
  description TEXT,
  unitPrice DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'JOD',
  createdAt BIGINT NOT NULL
);

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplierId INT,
  shipmentNumber VARCHAR(100) NOT NULL UNIQUE,
  origin VARCHAR(255),
  destination VARCHAR(255),
  departureDate BIGINT,
  arrivalDate BIGINT,
  status VARCHAR(50) DEFAULT 'pending',
  totalValue DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'JOD',
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT
);

-- Create containers table
CREATE TABLE IF NOT EXISTS containers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shipmentId INT,
  containerNumber VARCHAR(100) NOT NULL UNIQUE,
  containerType VARCHAR(50),
  sealNumber VARCHAR(100),
  weight DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'in_transit',
  currentLocation VARCHAR(255),
  eventDate BIGINT,
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT
);

-- Create containerTrackingEvents table
CREATE TABLE IF NOT EXISTS containerTrackingEvents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  containerId INT NOT NULL,
  eventType VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  eventDate BIGINT NOT NULL,
  description TEXT,
  createdAt BIGINT NOT NULL
);

-- Create customsDeclarations table
CREATE TABLE IF NOT EXISTS customsDeclarations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  containerId INT,
  declarationNumber VARCHAR(100) UNIQUE,
  declarationDate BIGINT,
  importerName VARCHAR(255),
  importerTaxId VARCHAR(100),
  goodsValue DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'JOD',
  customsDuty DECIMAL(15, 2),
  salesTax DECIMAL(15, 2),
  additionalFees DECIMAL(15, 2),
  declarationFee DECIMAL(15, 2),
  totalAmount DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'pending',
  pdfUrl TEXT,
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT
);

-- Create declarationItems table
CREATE TABLE IF NOT EXISTS declarationItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  declarationId INT NOT NULL,
  itemName VARCHAR(255) NOT NULL,
  hsCode VARCHAR(50),
  quantity INT,
  unitPrice DECIMAL(10, 2),
  totalValue DECIMAL(15, 2),
  customsDuty DECIMAL(15, 2),
  salesTax DECIMAL(15, 2),
  createdAt BIGINT NOT NULL
);
