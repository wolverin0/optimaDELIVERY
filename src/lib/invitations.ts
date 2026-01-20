import { supabase, TeamInvitation } from './supabase';

// Base URL for invitation links
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return 'https://optimadelivery.com';
};

export interface CreateInvitationResult {
    success: boolean;
    invitation?: TeamInvitation;
    inviteUrl?: string;
    error?: string;
}

export interface AcceptInvitationResult {
    success: boolean;
    tenantId?: string;
    tenantName?: string;
    role?: string;
    message?: string;
}

/**
 * Create a team invitation
 */
export async function createTeamInvitation(
    tenantId: string,
    email: string,
    role: 'staff' | 'admin' = 'staff'
): Promise<CreateInvitationResult> {
    try {
        // Call the database function to create invitation
        const { data, error } = await supabase.rpc('create_team_invitation', {
            p_tenant_id: tenantId,
            p_email: email.toLowerCase().trim(),
            p_role: role
        });

        if (error) {
            // Handle duplicate invitation error
            if (error.code === '23505') {
                return {
                    success: false,
                    error: 'Ya existe una invitación pendiente para este email'
                };
            }
            return {
                success: false,
                error: error.message
            };
        }

        if (!data || data.length === 0) {
            return {
                success: false,
                error: 'No se pudo crear la invitación'
            };
        }

        const result = data[0];
        const inviteUrl = `${getBaseUrl()}/join/${result.token}`;

        return {
            success: true,
            invitation: {
                id: result.invitation_id,
                tenant_id: tenantId,
                email: email.toLowerCase().trim(),
                role,
                token: result.token,
                invited_by: '', // We don't have this from the RPC
                expires_at: result.expires_at,
                accepted_at: null,
                created_at: new Date().toISOString()
            },
            inviteUrl
        };
    } catch (err) {
        console.error('Error creating invitation:', err);
        return {
            success: false,
            error: 'Error al crear la invitación'
        };
    }
}

/**
 * Get pending invitations for a tenant
 */
export async function getTenantInvitations(tenantId: string): Promise<TeamInvitation[]> {
    const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('tenant_id', tenantId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invitations:', error);
        return [];
    }

    return data || [];
}

/**
 * Delete/revoke an invitation
 */
export async function deleteInvitation(invitationId: string): Promise<boolean> {
    const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

    if (error) {
        console.error('Error deleting invitation:', error);
        return false;
    }

    return true;
}

/**
 * Get invitation details by token (for the join page)
 */
export async function getInvitationByToken(token: string): Promise<{
    invitation: TeamInvitation | null;
    tenantName: string | null;
    error?: string;
}> {
    const { data, error } = await supabase
        .from('team_invitations')
        .select(`
            *,
            tenants!inner(name)
        `)
        .eq('token', token)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error || !data) {
        return {
            invitation: null,
            tenantName: null,
            error: 'Invitación no encontrada, expirada o ya utilizada'
        };
    }

    return {
        invitation: data,
        tenantName: (data.tenants as { name: string })?.name || null
    };
}

/**
 * Accept a team invitation
 */
export async function acceptTeamInvitation(token: string): Promise<AcceptInvitationResult> {
    try {
        const { data, error } = await supabase.rpc('accept_team_invitation', {
            p_token: token
        });

        if (error) {
            return {
                success: false,
                message: error.message
            };
        }

        if (!data || data.length === 0) {
            return {
                success: false,
                message: 'Error al procesar la invitación'
            };
        }

        const result = data[0];
        return {
            success: result.success,
            tenantId: result.tenant_id,
            tenantName: result.tenant_name,
            role: result.role,
            message: result.message
        };
    } catch (err) {
        console.error('Error accepting invitation:', err);
        return {
            success: false,
            message: 'Error al aceptar la invitación'
        };
    }
}
