import { createSupabaseServiceClient } from './supabase/server';

export async function logAdminAction(adminId: string, actionType: string, targetId: string | null, details: Record<string, any>) {
  const supabase = createSupabaseServiceClient();
  await supabase.from('audit_logs').insert({
    admin_id: adminId,
    action_type: actionType,
    target_id: targetId,
    details_json: details
  });
}
