import { Instagram, Facebook, MessageCircle, Music2, Twitter } from 'lucide-react';
import { Tenant } from '@/lib/supabase';

interface SocialLinksBarProps {
    tenant: Tenant;
    variant?: 'default' | 'compact' | 'footer';
    className?: string;
}

interface SocialLink {
    key: keyof Pick<Tenant, 'social_instagram' | 'social_facebook' | 'social_whatsapp' | 'social_tiktok' | 'social_twitter'>;
    icon: React.ElementType;
    getUrl: (value: string) => string;
    label: string;
    color: string;
    hoverColor: string;
}

const SOCIAL_LINKS: SocialLink[] = [
    {
        key: 'social_instagram',
        icon: Instagram,
        getUrl: (v) => `https://instagram.com/${v.replace('@', '')}`,
        label: 'Instagram',
        color: 'text-pink-500',
        hoverColor: 'hover:bg-pink-50 hover:text-pink-600',
    },
    {
        key: 'social_facebook',
        icon: Facebook,
        getUrl: (v) => `https://facebook.com/${v}`,
        label: 'Facebook',
        color: 'text-blue-600',
        hoverColor: 'hover:bg-blue-50 hover:text-blue-700',
    },
    {
        key: 'social_whatsapp',
        icon: MessageCircle,
        getUrl: (v) => `https://wa.me/${v.replace(/[^0-9]/g, '')}`,
        label: 'WhatsApp',
        color: 'text-green-500',
        hoverColor: 'hover:bg-green-50 hover:text-green-600',
    },
    {
        key: 'social_tiktok',
        icon: Music2,
        getUrl: (v) => `https://tiktok.com/@${v.replace('@', '')}`,
        label: 'TikTok',
        color: 'text-slate-800',
        hoverColor: 'hover:bg-slate-100 hover:text-slate-900',
    },
    {
        key: 'social_twitter',
        icon: Twitter,
        getUrl: (v) => `https://x.com/${v.replace('@', '')}`,
        label: 'X',
        color: 'text-sky-500',
        hoverColor: 'hover:bg-sky-50 hover:text-sky-600',
    },
];

export const SocialLinksBar = ({ tenant, variant = 'default', className = '' }: SocialLinksBarProps) => {
    const activeSocials = SOCIAL_LINKS.filter(social => tenant[social.key]);

    if (activeSocials.length === 0) return null;

    if (variant === 'compact') {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                {activeSocials.map(social => {
                    const Icon = social.icon;
                    const value = tenant[social.key] as string;
                    return (
                        <a
                            key={social.key}
                            href={social.getUrl(value)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-full transition-colors ${social.color} ${social.hoverColor}`}
                            title={social.label}
                        >
                            <Icon className="w-4 h-4" />
                        </a>
                    );
                })}
            </div>
        );
    }

    if (variant === 'footer') {
        return (
            <div className={`flex items-center justify-center gap-4 py-4 ${className}`}>
                {activeSocials.map(social => {
                    const Icon = social.icon;
                    const value = tenant[social.key] as string;
                    return (
                        <a
                            key={social.key}
                            href={social.getUrl(value)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-3 rounded-full bg-white/10 backdrop-blur-sm transition-all hover:scale-110 ${social.color}`}
                            title={social.label}
                        >
                            <Icon className="w-5 h-5" />
                        </a>
                    );
                })}
            </div>
        );
    }

    // Default variant - pills with labels
    return (
        <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
            {activeSocials.map(social => {
                const Icon = social.icon;
                const value = tenant[social.key] as string;
                return (
                    <a
                        key={social.key}
                        href={social.getUrl(value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 transition-all hover:shadow-md hover:scale-105 ${social.color}`}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium text-slate-700">{social.label}</span>
                    </a>
                );
            })}
        </div>
    );
};
