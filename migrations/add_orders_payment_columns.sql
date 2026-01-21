-- Add payment-related columns to orders table
-- For MercadoPago payment tracking

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS mercadopago_preference_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT;

-- Add comments
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method: cash or mercadopago';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: pending, processing, paid, failed, refunded';
COMMENT ON COLUMN public.orders.mercadopago_preference_id IS 'MercadoPago checkout preference ID';
COMMENT ON COLUMN public.orders.mercadopago_payment_id IS 'MercadoPago payment ID after payment is made';

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
