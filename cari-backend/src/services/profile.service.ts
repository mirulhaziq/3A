import { getSupabaseAdmin } from '../lib/supabase';
import type { UpdateProfileInput } from '../schemas/profile.schema';
import type { Database, Json, UserRole } from '../types/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface UserProfileResponse {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  avatarUrl: string | null;
  targetRole: string | null;
  profileData: Json;
  onboarded: boolean;
  xp: number;
  streak: number;
  level: string;
  atsScore: number;
  skillMatch: number;
  createdAt: string;
  updatedAt: string;
}

async function getProfile(userId: string): Promise<UserProfileResponse> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
}

async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<UserProfileResponse> {
  const supabase = getSupabaseAdmin();

  const updatePayload = toUpdatePayload(input);

  const { data, error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
}

async function deleteProfile(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message);
  }
}

function toUpdatePayload(
  input: UpdateProfileInput
): Database['public']['Tables']['profiles']['Update'] {
  const payload: Database['public']['Tables']['profiles']['Update'] = {};

  if ('fullName' in input) payload.full_name = input.fullName;
  if ('avatarUrl' in input) payload.avatar_url = input.avatarUrl;
  if ('targetRole' in input) payload.target_role = input.targetRole;
  if ('profileData' in input) payload.profile_data = input.profileData as Json;
  if ('onboarded' in input) payload.onboarded = input.onboarded;
  if ('xp' in input) payload.xp = input.xp;
  if ('streak' in input) payload.streak = input.streak;
  if ('level' in input) payload.level = input.level;
  if ('atsScore' in input) payload.ats_score = input.atsScore;
  if ('skillMatch' in input) payload.skill_match = input.skillMatch;

  return payload;
}

function mapProfile(row: ProfileRow): UserProfileResponse {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    targetRole: row.target_role,
    profileData: row.profile_data,
    onboarded: row.onboarded,
    xp: row.xp,
    streak: row.streak,
    level: row.level,
    atsScore: row.ats_score,
    skillMatch: row.skill_match,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export { deleteProfile, getProfile, updateProfile };
export type { UserProfileResponse };
