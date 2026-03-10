-- ============================================
-- Duchonku Map - Pins 테이블 스키마
-- Supabase Query Editor에서 실행
-- ============================================

-- 1. roles 테이블에 admin/user 역할 추가
INSERT INTO public.roles (id, name)
VALUES
  (gen_random_uuid(), 'admin'),
  (gen_random_uuid(), 'user')
ON CONFLICT (name) DO NOTHING;

-- 2. pins 테이블 생성
CREATE TABLE public.pins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  lat         double precision NOT NULL,
  lng         double precision NOT NULL,
  category    text DEFAULT 'general',
  image_url   text,
  created_by  uuid REFERENCES public.users(id),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_pins_location ON public.pins (lat, lng);
CREATE INDEX idx_pins_category ON public.pins (category);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pins_updated_at
  BEFORE UPDATE ON public.pins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 3. RLS 정책 (Row Level Security)
ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;

-- 모든 인증 유저: 조회 가능
CREATE POLICY "pins_select_all"
  ON public.pins FOR SELECT
  TO authenticated
  USING (true);

-- admin만: 등록 가능
CREATE POLICY "pins_insert_admin"
  ON public.pins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- admin만: 수정 가능
CREATE POLICY "pins_update_admin"
  ON public.pins FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- admin만: 삭제 가능
CREATE POLICY "pins_delete_admin"
  ON public.pins FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- 비로그인 유저도 pin 조회 허용 (필요 시 주석 해제)
-- CREATE POLICY "pins_select_anon"
--   ON public.pins FOR SELECT
--   TO anon
--   USING (true);
