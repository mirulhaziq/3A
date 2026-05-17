import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import type { Database } from '../types/database.types';

interface LegacySupabaseTable {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
}

interface LegacySupabaseDatabase {
  public: {
    Tables: Record<string, LegacySupabaseTable>;
    Views: Record<string, LegacySupabaseTable>;
    Functions: Record<
      string,
      { Args: Record<string, unknown>; Returns: unknown }
    >;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, unknown>;
  };
}

function isSupabaseConfigured(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
}

function createSupabaseClient(): SupabaseClient<LegacySupabaseDatabase> {
  return createClient<LegacySupabaseDatabase>(
    env.SUPABASE_URL ?? 'http://localhost',
    env.SUPABASE_SERVICE_ROLE_KEY ?? 'missing-service-role-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

const supabase = createSupabaseClient();
const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL ?? 'http://localhost',
  env.SUPABASE_SERVICE_ROLE_KEY ?? 'missing-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

function getSupabaseAdmin(): SupabaseClient<Database> {
  assertSupabaseConfigured();
  return supabaseAdmin;
}

async function checkSupabaseConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase environment variables are not configured yet.',
    };
  }

  const { error } = await supabaseAdmin.rpc('health_check');

  if (error) {
    return {
      configured: true,
      connected: false,
      message: error.message,
    };
  }

  return {
    configured: true,
    connected: true,
    message: 'Supabase connection is healthy.',
  };
}

export {
  supabase,
  getSupabaseAdmin,
  isSupabaseConfigured,
  checkSupabaseConnection,
};
