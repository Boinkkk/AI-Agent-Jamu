CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id INT REFERENCES roles(id),
  username VARCHAR(50),
  email VARCHAR(100),
  password_hash TEXT,
  full_name VARCHAR(100),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  label VARCHAR(50),
  recipient_name VARCHAR(100),
  phone_number VARCHAR(20),
  address_line TEXT,
  city VARCHAR(50),
  province VARCHAR(50),
  postal_code VARCHAR(10),
  is_main BOOLEAN DEFAULT FALSE
);

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id INT REFERENCES categories(id),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  weight_grams INT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  average_rating NUMERIC(3,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  benefit TEXT,
  composition TEXT,
  directions TEXT,
  storage_instructions TEXT,
  manufacturer VARCHAR(100),
  marketing_location VARCHAR(100),
  production_location VARCHAR(50),
  regency VARCHAR(50),
  licensing VARCHAR(20),
  licensing_number VARCHAR(100)
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id),
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id),
  sender_role VARCHAR(20) CHECK (sender_role IN ('user', 'assistant')),
  message_content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE couriers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(50) NOT NULL,
  service_type VARCHAR(50)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_transaction_id VARCHAR(100),
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  amount NUMERIC(12,2) NOT NULL,
  payment_url TEXT,
  paid_at TIMESTAMP
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  payment_id UUID REFERENCES payments(id),
  address_id UUID REFERENCES addresses(id),
  courier_id INT REFERENCES couriers(id),
  total_items_price NUMERIC(12,2) NOT NULL,
  shipping_cost NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  tracking_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  price_at_purchase NUMERIC(12,2) NOT NULL
);

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  status VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rag_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  content TEXT NOT NULL,
  source_type VARCHAR(50),
  tags JSONB,
  vector_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);