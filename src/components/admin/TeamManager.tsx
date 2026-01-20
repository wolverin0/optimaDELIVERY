import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Trash2, Mail, Users } from 'lucide-react';
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
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteFormData, setInviteFormData] = useState({
        email: '',
        role: 'staff' as 'admin' | 'kitchen' | 'staff',
    });

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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamMembers();
    }, [tenant?.id, token]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inviteFormData.email || !tenant?.id) {
            toast({ title: 'Email requerido', variant: 'destructive' });
            return;
        }

        setIsInviting(true);

        try {
            // Check if user already exists
            const checkRes = await fetch(
                `${SUPABASE_URL}/rest/v1/users?email=eq.${inviteFormData.email}&select=id`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': SUPABASE_ANON_KEY,
                    },
                }
            );
            const existingUsers = await checkRes.json();

            if (existingUsers.length > 0) {
                // User exists - update their tenant_id and role
                const res = await fetch(
                    `${SUPABASE_URL}/rest/v1/users?id=eq.${existingUsers[0].id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'apikey': SUPABASE_ANON_KEY,
                        },
                        body: JSON.stringify({
                            tenant_id: tenant.id,
                            role: inviteFormData.role,
                        }),
                    }
                );

                if (!res.ok) throw new Error('Failed to add team member');
                toast({ title: 'Miembro agregado', description: `${inviteFormData.email} ahora tiene acceso.` });
            } else {
                // User doesn't exist - create a pending invite record
                // For now, just show a message that they need to sign up first
                toast({
                    title: 'Usuario no registrado',
                    description: `${inviteFormData.email} debe crear una cuenta primero. Después podrás agregarlo.`,
                    variant: 'destructive'
                });
                setIsInviting(false);
                return;
            }

            await fetchTeamMembers();
            setShowInviteForm(false);
            setInviteFormData({ email: '', role: 'staff' });
        } catch (error) {
            console.error('Error inviting:', error);
            toast({ title: 'Error', description: 'No se pudo agregar el miembro', variant: 'destructive' });
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            // Remove from tenant by clearing tenant_id
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
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
                    <Button onClick={() => setShowInviteForm(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Agregar Miembro
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

            {/* Invite Dialog */}
            <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Agregar Miembro</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
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
                            <p className="text-xs text-slate-500">
                                El usuario debe tener una cuenta existente.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label>Rol</Label>
                            <Select
                                value={inviteFormData.role}
                                onValueChange={(v: 'admin' | 'kitchen' | 'staff') => setInviteFormData(prev => ({ ...prev, role: v }))}
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
                                    <SelectItem value="kitchen">
                                        <div className="flex flex-col">
                                            <span>Cocina</span>
                                            <span className="text-xs text-slate-500">Solo ve pedidos en cocina</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="staff">
                                        <div className="flex flex-col">
                                            <span>Staff</span>
                                            <span className="text-xs text-slate-500">Acceso limitado</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-3 pt-4 border-t">
                            <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowInviteForm(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isInviting}>
                                {isInviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                Agregar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
