-- MFL LABS - DEFINITIVE SCHEMA RESET (run this alone, nothing else)

-- Step 1: Remove trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Nuke all policies that might exist (covers every name used historically)
DO $$ 
BEGIN
  -- Drop policies if the table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admin manage all profiles" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Service role full access" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Allow All" ON public.profiles';
  END IF;
END $$;

-- Step 3: Drop profiles table entirely
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 4: Create fresh profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'pending',
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies
CREATE POLICY "Admin manage all profiles" ON public.profiles
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'markmallan01@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'markmallan01@gmail.com');

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Step 7: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, approved)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'markmallan01@gmail.com' THEN 'super_admin' ELSE 'pending' END,
    CASE WHEN NEW.email = 'markmallan01@gmail.com' THEN TRUE ELSE FALSE END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Sync any existing auth users (upsert-safe)
INSERT INTO public.profiles (id, email, approved, role)
SELECT
  id, email,
  (email = 'markmallan01@gmail.com') AS approved,
  CASE WHEN email = 'markmallan01@gmail.com' THEN 'super_admin' ELSE 'pending' END AS role
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Confirm success
SELECT 'SUCCESS: profiles count = ' || COUNT(*)::text FROM public.profiles;
