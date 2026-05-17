import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
} from '../lib/supabase';
import type { Database, UserRole } from '../types/database.types';
import type {
  LoginInput,
  RefreshSessionInput,
  RegisterInput,
} from '../schemas/auth.schema';

interface AuthProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  targetRole: string | null;
  onboarded: boolean;
  xp: number;
  streak: number;
  level: string;
}

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
  tokenType: string;
}

interface AuthResponse {
  user: AuthProfile;
  session: AuthSession | null;
}

interface RegisterResponse extends AuthResponse {
  company: {
    id: string;
    name: string;
  } | null;
}

function assertAuthConfigured(): void {
  if (!isSupabaseConfigured() || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase Auth is not configured. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
}

function getSupabaseAuthClient() {
  assertAuthConfigured();
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase Auth is not configured.');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function register(input: RegisterInput): Promise<RegisterResponse> {
  assertAuthConfigured();

  const supabaseAdmin = getSupabaseAdmin();
  const { data: createdUser, error: createUserError } =
    await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        role: input.role,
        fullName: input.fullName ?? null,
      },
    });

  if (createUserError) {
    throw new Error(createUserError.message);
  }

  if (!createdUser.user) {
    throw new Error('Supabase did not return a created user.');
  }

  const userId = createdUser.user.id;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      role: input.role,
      email: input.email,
      full_name: input.fullName ?? null,
      profile_data: {},
    })
    .select(
      'id,email,role,full_name,target_role,onboarded,xp,streak,level'
    )
    .single();

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error(profileError.message);
  }

  let company: RegisterResponse['company'] = null;

  if (input.role === 'COMPANY') {
    const { data: createdCompany, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        owner_id: userId,
        name: input.companyName ?? 'Company',
      })
      .select('id,name')
      .single();

    if (companyError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(companyError.message);
    }

    company = createdCompany;
  }

  return {
    user: mapProfile(profile),
    session: null,
    company,
  };
}

async function login(input: LoginInput): Promise<AuthResponse> {
  const supabaseAuth = getSupabaseAuthClient();
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user || !data.session) {
    throw new Error('Invalid login response from Supabase.');
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id,email,role,full_name,target_role,onboarded,xp,streak,level')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return {
    user: mapProfile(profile),
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? null,
      tokenType: data.session.token_type,
    },
  };
}

async function refreshSession(
  input: RefreshSessionInput
): Promise<AuthSession> {
  const supabaseAuth = getSupabaseAuthClient();
  const { data, error } = await supabaseAuth.auth.refreshSession({
    refresh_token: input.refreshToken,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session) {
    throw new Error('Invalid refresh response from Supabase.');
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at ?? null,
    tokenType: data.session.token_type,
  };
}

async function getProfileByUserId(userId: string): Promise<AuthProfile> {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id,email,role,full_name,target_role,onboarded,xp,streak,level')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
}

function mapProfile(
  row: Pick<
    Database['public']['Tables']['profiles']['Row'],
    | 'id'
    | 'email'
    | 'role'
    | 'full_name'
    | 'target_role'
    | 'onboarded'
    | 'xp'
    | 'streak'
    | 'level'
  >
): AuthProfile {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    fullName: row.full_name,
    targetRole: row.target_role,
    onboarded: row.onboarded,
    xp: row.xp,
    streak: row.streak,
    level: row.level,
  };
}

export {
  getProfileByUserId,
  getSupabaseAuthClient,
  login,
  refreshSession,
  register,
};
export type { AuthProfile, AuthResponse, AuthSession, RegisterResponse };
