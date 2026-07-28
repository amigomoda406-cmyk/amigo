-- ============================================
-- 1. ORDERS TABLE — الطلبات الرئيسية
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات العميل
  customer_name  TEXT NOT NULL CHECK (char_length(customer_name) >= 3),
  customer_phone TEXT NOT NULL CHECK (customer_phone ~ '^(0)(5|6|7)[0-9]{8}$'),
  
  -- معلومات التوصيل
  wilaya         TEXT NOT NULL,
  address        TEXT NOT NULL CHECK (char_length(address) >= 10),
  delivery_type  TEXT NOT NULL CHECK (delivery_type IN ('home', 'post')),
  delivery_fee   INTEGER NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  
  -- بيانات الطلب (JSON)
  items          JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- الأسعار (بالدينار الجزائري)
  subtotal       INTEGER NOT NULL CHECK (subtotal > 0),
  total          INTEGER NOT NULL CHECK (total > 0),
  
  -- الدفع
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod')),
  
  -- الحالة
  status         TEXT NOT NULL DEFAULT 'pending' 
                 CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  
  -- ملاحظات
  notes          TEXT DEFAULT '',
  
  -- ملاحظات الأدمين (داخلية)
  admin_notes    TEXT DEFAULT '',
  
  -- تتبع الشحن
  tracking_number TEXT DEFAULT NULL,
  
  -- التواريخ
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at   TIMESTAMPTZ DEFAULT NULL,
  shipped_at     TIMESTAMPTZ DEFAULT NULL,
  delivered_at   TIMESTAMPTZ DEFAULT NULL,
  cancelled_at   TIMESTAMPTZ DEFAULT NULL
);

-- Index للبحث السريع
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_phone ON public.orders (customer_phone);
CREATE INDEX idx_orders_wilaya ON public.orders (wilaya);
CREATE INDEX idx_orders_created_at ON public.orders (created_at DESC);


-- ============================================
-- 2. ORDER STATUS HISTORY — سجل تغيير الحالة
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT DEFAULT 'system', -- 'system' أو 'admin'
  note       TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_order ON public.order_status_history (order_id);


-- ============================================
-- 3. DELIVERY_FEES TABLE — رسوم التوصيل بالولاية
-- ============================================
CREATE TABLE IF NOT EXISTS public.delivery_fees (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wilaya     TEXT NOT NULL UNIQUE,
  home_fee   INTEGER NOT NULL DEFAULT 500,  -- دج
  post_fee   INTEGER NOT NULL DEFAULT 300,  -- دج
  is_remote  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_fees_wilaya ON public.delivery_fees (wilaya);


-- ============================================
-- 4. ADMIN_USERS TABLE — مستخدمو الأدمين
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'viewer')),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NULL
);


-- ============================================
-- 5. SETTINGS TABLE — إعدادات المتجر
-- ============================================
CREATE TABLE IF NOT EXISTS public.settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- إدراج الإعدادات الافتراضية
INSERT INTO public.settings (key, value) VALUES
  ('store_open', 'true'::jsonb),
  ('min_order_amount', '1000'::jsonb),
  ('free_delivery_threshold', '5000'::jsonb),
  ('contact_whatsapp', '"0671815533"'::jsonb),
  ('telegram_notifications', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- تفعيل RLS على جميع الجداول
-- ============================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORDERS — سياسات الوصول
-- ============================================

-- السماح للـ Service Role بكل شيء (API Routes)
CREATE POLICY "service_role_all_orders"
  ON public.orders
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- السماح للـ anon بإنشاء الطلبات فقط (من الواجهة)
CREATE POLICY "anon_insert_orders"
  ON public.orders
  FOR INSERT
  TO anon
  WITH CHECK (TRUE);

-- ============================================
-- DELIVERY_FEES — قراءة مفتوحة، كتابة محمية
-- ============================================
CREATE POLICY "public_read_delivery_fees"
  ON public.delivery_fees
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "service_role_write_delivery_fees"
  ON public.delivery_fees
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================
-- SETTINGS — قراءة مفتوحة، كتابة محمية
-- ============================================
CREATE POLICY "public_read_settings"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "service_role_write_settings"
  ON public.settings
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================
-- 1. Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تفعيل على جدول الطلبات
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- تفعيل على جدول رسوم التوصيل
CREATE TRIGGER set_delivery_fees_updated_at
  BEFORE UPDATE ON public.delivery_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 2. تسجيل تاريخ تغيير الحالة
-- ============================================
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
    
    CASE NEW.status
      WHEN 'confirmed' THEN NEW.confirmed_at = NOW();
      WHEN 'shipped' THEN NEW.shipped_at = NOW();
      WHEN 'delivered' THEN NEW.delivered_at = NOW();
      WHEN 'cancelled' THEN NEW.cancelled_at = NOW();
      ELSE
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_order_status
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_status_change();

-- ============================================
-- 3. إحصائيات المبيعات (View)
-- ============================================
CREATE OR REPLACE VIEW public.sales_stats AS
SELECT
  COUNT(*) AS total_orders,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
  COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_orders,
  COUNT(*) FILTER (WHERE status = 'processing') AS processing_orders,
  COUNT(*) FILTER (WHERE status = 'shipped') AS shipped_orders,
  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,
  
  COALESCE(SUM(total) FILTER (WHERE status NOT IN ('cancelled', 'returned')), 0) AS total_revenue,
  COALESCE(SUM(total) FILTER (WHERE status = 'delivered'), 0) AS confirmed_revenue,
  
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) AS today_orders,
  COALESCE(SUM(total) FILTER (WHERE created_at >= CURRENT_DATE AND status != 'cancelled'), 0) AS today_revenue,
  
  COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', NOW())) AS week_orders,
  
  COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW())) AS month_orders,
  COALESCE(SUM(total) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW()) AND status != 'cancelled'), 0) AS month_revenue,
  
  COALESCE(AVG(total) FILTER (WHERE status NOT IN ('cancelled', 'returned')), 0)::INTEGER AS avg_order_value
FROM public.orders;

GRANT SELECT ON public.sales_stats TO service_role;

-- ============================================
-- 4. إحصائيات حسب الولاية (View)
-- ============================================
CREATE OR REPLACE VIEW public.wilaya_stats AS
SELECT
  wilaya,
  COUNT(*) AS total_orders,
  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,
  COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'), 0) AS revenue
FROM public.orders
GROUP BY wilaya
ORDER BY total_orders DESC;

GRANT SELECT ON public.wilaya_stats TO service_role;

-- ============================================
-- 5. أكثر المنتجات مبيعاً (Function)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_top_products(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  product_id    TEXT,
  product_title TEXT,
  total_sold    BIGINT,
  total_revenue BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (item->>'productId')::TEXT AS product_id,
    (item->>'title')::TEXT AS product_title,
    SUM((item->>'quantity')::INTEGER) AS total_sold,
    SUM((item->>'subtotal')::INTEGER) AS total_revenue
  FROM public.orders,
       jsonb_array_elements(items) AS item
  WHERE status NOT IN ('cancelled', 'returned')
  GROUP BY product_id, product_title
  ORDER BY total_sold DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_top_products TO service_role;

-- ============================================
-- 6. إدراج رسوم التوصيل الافتراضية (الجزائر)
-- ============================================
INSERT INTO public.delivery_fees (wilaya, home_fee, post_fee, is_remote) VALUES
('Alger', 400, 250, FALSE), ('Oran', 450, 300, FALSE), ('Constantine', 500, 300, FALSE),
('Annaba', 500, 300, FALSE), ('Blida', 450, 280, FALSE), ('Boumerdès', 450, 280, FALSE),
('Tipaza', 450, 280, FALSE), ('Médéa', 500, 300, FALSE), ('Djelfa', 550, 350, FALSE),
('Tizi Ouzou', 500, 300, FALSE), ('Béjaïa', 550, 350, FALSE), ('Sétif', 550, 350, FALSE),
('Batna', 550, 350, FALSE), ('Biskra', 600, 380, FALSE), ('Tébessa', 600, 380, FALSE),
('Ouargla', 650, 400, TRUE), ('Laghouat', 600, 380, FALSE), ('Ghardaïa', 650, 400, TRUE),
('Mascara', 550, 350, FALSE), ('Sidi Bel Abbès', 500, 320, FALSE), ('Tlemcen', 500, 320, FALSE),
('Mostaganem', 500, 320, FALSE), ('Chlef', 500, 320, FALSE), ('Aïn Defla', 500, 320, FALSE),
('Tiaret', 550, 350, FALSE), ('Relizane', 550, 350, FALSE), ('Tissemsilt', 550, 350, FALSE),
('Saïda', 550, 350, FALSE), ('El Bayadh', 650, 400, TRUE), ('Naâma', 650, 400, TRUE),
('Béchar', 700, 450, TRUE), ('Jijel', 550, 350, FALSE), ('Skikda', 550, 350, FALSE),
('Guelma', 550, 350, FALSE), ('Souk Ahras', 600, 380, FALSE), ('El Tarf', 550, 350, FALSE),
('Khenchela', 600, 380, FALSE), ('Oum El Bouaghi', 550, 350, FALSE), ('Mila', 550, 350, FALSE),
('Bordj Bou Arréridj', 550, 350, FALSE), ('M''Sila', 550, 350, FALSE), ('Bouira', 500, 320, FALSE),
('Aïn Témouchent', 500, 320, FALSE), ('Illizi', 1000, 700, TRUE), ('Tamanrasset', 1000, 700, TRUE),
('Adrar', 900, 600, TRUE), ('Tindouf', 1000, 700, TRUE), ('Bordj Badji Mokhtar', 1000, 700, TRUE),
('In Guezzam', 1000, 700, TRUE), ('In Salah', 900, 600, TRUE), ('Touggourt', 700, 450, TRUE),
('Ouled Djellal', 650, 400, TRUE), ('El Oued', 700, 450, TRUE), ('Djanet', 1000, 700, TRUE),
('El M''Ghair', 700, 450, TRUE), ('El Meniaa', 700, 450, TRUE), ('Timimoun', 900, 600, TRUE),
('Béni Abbès', 900, 600, TRUE)
ON CONFLICT (wilaya) DO NOTHING;
