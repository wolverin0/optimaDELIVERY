-- Subscription Payments Tracking Table
-- Stores platform subscription payment records

CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
    amount DECIMAL(10,2) NOT NULL,
    preference_id TEXT,
    payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
    external_reference TEXT,
    payment_method TEXT,
    payer_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_payments_tenant ON subscription_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_preference ON subscription_payments(preference_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_payment ON subscription_payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_created ON subscription_payments(created_at DESC);

-- Enable RLS
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Tenants can view their own subscription payments
CREATE POLICY "Tenants can view own subscription payments"
    ON subscription_payments
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
        )
    );

-- Only service role can insert/update
CREATE POLICY "Service role can insert subscription payments"
    ON subscription_payments
    FOR INSERT
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can update subscription payments"
    ON subscription_payments
    FOR UPDATE
    USING (auth.jwt()->>'role' = 'service_role');

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_subscription_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_payments_updated_at
    BEFORE UPDATE ON subscription_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_payments_updated_at();

-- Comments
COMMENT ON TABLE subscription_payments IS 'Tracks platform subscription payments from tenants';
COMMENT ON COLUMN subscription_payments.plan_type IS 'monthly or annual subscription';
COMMENT ON COLUMN subscription_payments.amount IS 'Amount in ARS';
COMMENT ON COLUMN subscription_payments.preference_id IS 'MercadoPago preference ID';
COMMENT ON COLUMN subscription_payments.payment_id IS 'MercadoPago payment ID after approval';
COMMENT ON COLUMN subscription_payments.status IS 'Payment status from MercadoPago';
