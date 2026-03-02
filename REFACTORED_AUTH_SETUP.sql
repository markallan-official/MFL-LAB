-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'pending',
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Admin Policy: markmallan01@gmail.com is the super admin
CREATE POLICY "Admin manage all profiles" ON public.profiles
  FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'markmallan01@gmail.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'markmallan01@gmail.com'
  );

-- User Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
  );

-- 4. Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, approved)
  VALUES (
    NEW.id,
    NEW.email,
    'pending',
    CASE 
      WHEN NEW.email = 'markmallan01@gmail.com' THEN TRUE 
      ELSE FALSE 
    END
  );
  
  -- If super admin, set role immediately
  IF NEW.email = 'markmallan01@gmail.com' THEN
    UPDATE public.profiles SET role = 'super_admin', approved = TRUE WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Sync existing users (Optional but recommended)
INSERT INTO public.profiles (id, email, approved, role)
SELECT 
  id, 
  email, 
  (email = 'markmallan01@gmail.com') as approved,
  CASE WHEN email = 'markmallan01@gmail.com' THEN 'super_admin' ELSE 'pending' END as role
FROM auth.users
ON CONFLICT (id) DO NOTHING;
