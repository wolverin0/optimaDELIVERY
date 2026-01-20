import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Trash2, Mail, Users, Copy, Link2, Clock, CheckCircle2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { createTeamInvitation, getTenantInvitations, deleteInvitation } from '@/lib/invitations';
import { TeamInvitation } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface TeamMember {
    id: string;
    email: string;
    full_name: string | null;
    role: 'owner' | 'admin' | 'kitchen' | 'staff';
    created_at: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    owner: { label: 'Propietario', color: 'bg-purple-100 text-purple-700' },
    admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-700' },
    kitchen: { label: 'Cocina', color: 'bg-orange-100 text-orange-700' },
    staff: { label: 'Staff', color: 'bg-slate-100 text-slate-700' },
};

export const TeamManager = () => {
    const { tenant } = useTenant();
    const { session, profile } = useAuth();
    const { toast } = useToast();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteFormData, setInviteFormData] = useState({
        email: '',
        role: 'staff' as 'admin' | 'staff',
    });
    const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);

    const token = session?.access_token || '';

    const fetchTeamMembers = async () => {
        if (!tenant?.id || !token) return;

        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/users?tenant_id=eq.${tenant.id}&select=id,email,full_name,role,created_at`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': SUPABASE_ANON_KEY,
                    },
                }
            );
            if (res.ok) {
                const data = await res.json();
                setTeamMembers(data);
            }
        } catch (err) {
            console.error('Error fetching team:', err);
        }
    };

    const fetchInvitations = async () => {
        if (!tenant?.id) return;
        const invitations = await getTenantInvitations(tenant.id);
        setPendingInvitations(invitations);
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchTeamMembers(), fetchInvitations()]);
            setIsLoading(false);
        };
        loadData();
    }, [tenant?.id, token]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inviteFormData.email || !tenant?.id) {
            toast({ title: 'Email requerido', variant: 'destructive' });
            return;
        }

        setIsInviting(true);

        try {
            const result = await createTeamInvitation(
                tenant.id,
                inviteFormData.email,
                inviteFormData.role
            );

            if (!result.success) {
                toast({
                    title: 'Error',
                    description: result.error || 'No se pudo crear la invitación',
                    variant: 'destructive'
                });
                setIsInviting(false);
                return;
            }

            // Show success with invite URL
            setGeneratedInviteUrl(result.inviteUrl || null);
            toast({
                title: 'Invitación creada',
                description: 'Comparte el enlace con el nuevo miembro'
            });

            await fetchInvitations();
            setInviteFormData({ email: '', role: 'staff' });
        } catch (error) {
            console.error('Error inviting:', error);
            toast({ title: 'Error', description: 'No se pudo crear la invitación', variant: 'destructive' });
        } finally {
            setIsInviting(false);
        }
    };

    const handleCopyInviteUrl = () => {
        if (generatedInviteUrl) {
            navigator.clipboard.writeText(generatedInviteUrl);
            toast({ title: 'Enlace copiado' });
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/users?id=eq.${memberId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'apikey': SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({
                        tenant_id: null,
                        role: 'staff',
                    }),
                }
            );

            if (!res.ok) throw new Error('Failed to remove');
            toast({ title: 'Miembro eliminado' });
            await fetchTeamMembers();
        } catch (error) {
            console.error('Error removing:', error);
            toast({ title: 'Error', variant: 'destructive' });
        }
    };

    const handleRevokeInvitation = async (invitationId: string) => {
        const success = await deleteInvitation(invitationId);
        if (success) {
            toast({ title: 'Invitación cancelada' });
            await fetchInvitations();
        } else {
            toast({ title: 'Error', variant: 'destructive' });
        }
    };

    const handleChangeRole = async (memberId: string, newRole: string) => {
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/users?id=eq.${memberId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'apikey': SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ role: newRole }),
                }
            );

            if (!res.ok) throw new Error('Failed to update role');
            toast({ title: 'Rol actualizado' });
            await fetchTeamMembers();
        } catch (error) {
            console.error('Error updating role:', error);
            toast({ title: 'Error', variant: 'destructive' });
        }
    };

    const formatExpirationDate = (expiresAt: string) => {
        const date = new Date(expiresAt);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 'Expirada';
        if (diffDays === 1) return 'Expira mañana';
        return `Expira en ${diffDays} días`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Team Members Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Equipo
                            </CardTitle>
                            <CardDescription>
                                Miembros con acceso a este negocio.
                            </CardDescription>
                        </div>
                        <Button onClick={() => { setShowInviteForm(true); setGeneratedInviteUrl(null); }}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invitar Miembro
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg divide-y">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                        {(member.full_name || member.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{member.full_name || 'Sin nombre'}</p>
                                        <p className="text-sm text-slate-500">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {member.role === 'owner' ? (
                                        <Badge className={ROLE_LABELS[member.role].color}>
                                            {ROLE_LABELS[member.role].label}
                                        </Badge>
                                    ) : (
                                        <Select
                                            value={member.role}
                                            onValueChange={(v) => handleChangeRole(member.id, v)}
                                            disabled={member.id === profile?.id}
                                        >
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Administrador</SelectItem>
                                                <SelectItem value="kitchen">Cocina</SelectItem>
                                                <SelectItem value="staff">Staff</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {member.role !== 'owner' && member.id !== profile?.id && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {member.email} perderá acceso a este negocio.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive"
                                                        onClick={() => handleRemoveMember(member.id)}
                                                    >
                                                        Eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </div>
                        ))}

                        {teamMembers.length === 0 && (
                            <div className="p-8 text-center text-slate-500">
                                No hay miembros del equipo
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Pending Invitations Card */}
            {pendingInvitations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Clock className="w-4 h-4 text-amber-500" />
                            Invitaciones Pendientes
                        </CardTitle>
                        <CardDescription>
                            Personas que aún no han aceptado la invitación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg divide-y">
                            {pendingInvitations.map((invitation) => (
                                <div key={invitation.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{invitation.email}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Badge variant="outline" className="text-xs">
                                                    {ROLE_LABELS[invitation.role]?.label || invitation.role}
                                                </Badge>
                                                <span>{formatExpirationDate(invitation.expires_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const url = `${window.location.origin}/join/${invitation.token}`;
                                                navigator.clipboard.writeText(url);
                                                toast({ title: 'Enlace copiado' });
                                            }}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Cancelar invitación?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        El enlace de invitación dejará de funcionar.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>No, mantener</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive"
                                                        onClick={() => handleRevokeInvitation(invitation.id)}
                                                    >
                                                        Sí, cancelar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Invite Dialog */}
            <Dialog open={showInviteForm} onOpenChange={(open) => { setShowInviteForm(open); if (!open) setGeneratedInviteUrl(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Invitar Miembro</DialogTitle>
                    </DialogHeader>

                    {generatedInviteUrl ? (
                        // Show success state with invite URL
                        <div className="space-y-4">
                            <div className="flex items-center justify-center py-4">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <p className="text-center text-slate-600">
                                Invitación creada. Comparte este enlace:
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                                <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    readOnly
                                    value={generatedInviteUrl}
                                    className="flex-1 bg-transparent text-sm text-slate-600 outline-none truncate"
                                />
                                <Button size="sm" onClick={handleCopyInviteUrl}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-center text-slate-500">
                                El enlace expira en 7 días.
                            </p>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => { setShowInviteForm(false); setGeneratedInviteUrl(null); }}
                            >
                                Listo
                            </Button>
                        </div>
                    ) : (
                        // Show invite form
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email del nuevo miembro</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="miembro@email.com"
                                        value={inviteFormData.email}
                                        onChange={e => setInviteFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Rol</Label>
                                <Select
                                    value={inviteFormData.role}
                                    onValueChange={(v: 'admin' | 'staff') => setInviteFormData(prev => ({ ...prev, role: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            <div className="flex flex-col">
                                                <span>Administrador</span>
                                                <span className="text-xs text-slate-500">Acceso completo al dashboard</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="staff">
                                            <div className="flex flex-col">
                                                <span>Staff / Cocina</span>
                                                <span className="text-xs text-slate-500">Acceso a pedidos y cocina</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                                <p>Se generará un enlace de invitación que podrás compartir.</p>
                                <p className="text-xs mt-1 text-blue-600">No necesitan cuenta previa - pueden registrarse desde el enlace.</p>
                            </div>
                            <div className="flex gap-3 pt-4 border-t">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowInviteForm(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1" disabled={isInviting}>
                                    {isInviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                    Crear Invitación
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
