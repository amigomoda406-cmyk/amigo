-- supabase/migrations/00000_init.sql

-- 1. Create orders table
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    wilaya TEXT NOT NULL,
    commune TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create order_items table
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL, -- Sanity Document ID
    product_name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    selected_size TEXT,
    selected_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Setup Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert orders (for checkout)
CREATE POLICY "Enable insert for anonymous users" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for anonymous users" ON public.order_items FOR INSERT WITH CHECK (true);

-- Allow authenticated admins to read/update all orders
CREATE POLICY "Enable read for authenticated users" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON public.order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.order_items FOR UPDATE USING (auth.role() = 'authenticated');
