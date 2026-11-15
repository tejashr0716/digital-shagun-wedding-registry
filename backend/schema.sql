CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS gifts CASCADE;
DROP TABLE IF EXISTS registry_goals CASCADE;
DROP TABLE IF EXISTS weddings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    role VARCHAR(30) DEFAULT 'COUPLE_ADMIN',
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE weddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES users(id) ON DELETE CASCADE,
    slug VARCHAR(100) UNIQUE NOT NULL,
    bride_name VARCHAR(100) NOT NULL,
    groom_name VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    venue VARCHAR(255),
    story TEXT,
    cover_image_url TEXT,
    payout_bank_account JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE registry_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    collected_amount NUMERIC(12, 2) DEFAULT 0.00,
    cover_image_url TEXT,
    show_target_amount BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES registry_goals(id) ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(20),
    guest_message TEXT,
    gross_amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    net_amount NUMERIC(10, 2) NOT NULL,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100) UNIQUE,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(100) UNIQUE NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_weddings_slug ON weddings(slug);
CREATE INDEX idx_registry_goals_wedding ON registry_goals(wedding_id);
CREATE INDEX idx_gifts_wedding_status ON gifts(wedding_id, payment_status);
CREATE INDEX idx_gifts_goal_id ON gifts(goal_id);
