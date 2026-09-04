import React from 'react';
import {
  Flame,
  Crown,
  Sparkles,
  Clock,
  ShieldCheck,
  Shield,
  Award,
  Zap,
  TrendingUp,
  CheckCircle2,
  CheckCircle,
  Ticket,
  Building2,
  Users,
  Mic,
  Dumbbell,
  Star,
  Heart,
  Activity,
  FileText,
  Target,
  Gift,
  Check
} from 'lucide-react';

export const CONTEXTUAL_ICONS_MAP = {
  Flame,
  Crown,
  Sparkles,
  Clock,
  ShieldCheck,
  Shield,
  Award,
  Zap,
  TrendingUp,
  CheckCircle2,
  CheckCircle,
  Ticket,
  Building2,
  Users,
  Mic,
  Dumbbell,
  Star,
  Heart,
  Activity,
  FileText,
  Target,
  Gift,
  Check
};

export const CURATED_ICONS_LIST = [
  { id: 'CheckCircle2', label: '✅ Check de Validação', icon: CheckCircle2 },
  { id: 'Flame', label: '🔥 Alta Procura / Fogo', icon: Flame },
  { id: 'Crown', label: '👑 VIP / Autoridade', icon: Crown },
  { id: 'Sparkles', label: '✨ Exclusividade / Transformação', icon: Sparkles },
  { id: 'Award', label: '🏆 Certificado / Prêmio', icon: Award },
  { id: 'Zap', label: '⚡ Eletroestimulação / Energia', icon: Zap },
  { id: 'TrendingUp', label: '📈 Faturamento / Lucro', icon: TrendingUp },
  { id: 'ShieldCheck', label: '🛡️ Segurança / Garantia', icon: ShieldCheck },
  { id: 'Dumbbell', label: '💪 Musculação / Músculo', icon: Dumbbell },
  { id: 'Clock', label: '⏳ Tempo / Vagas', icon: Clock },
  { id: 'Ticket', label: '🎟️ Ingresso / Passaporte', icon: Ticket },
  { id: 'Users', label: '👥 Networking / Comunidade', icon: Users },
  { id: 'Mic', label: '🎙️ Palestrante / Palco', icon: Mic },
  { id: 'Building2', label: '🏛️ Auditório / Espaço', icon: Building2 },
  { id: 'Star', label: '⭐ Destaque Especial', icon: Star },
  { id: 'Target', label: '🎯 Alvo / Objetivo Clínico', icon: Target },
];

export const CURATED_EMOJIS_LIST = [
  '🔥', '👑', '✨', '⚡', '🏆', '💎', '🚀', '🎯', 
  '💪', '🧠', '🎟️', '⏳', '🛡️', '📈', '🌟', '🤝', 
  '🔬', '🎓', '💼', '📍', '✅', '🎁', '⭐'
];

/**
 * Renderiza um ícone contextual (Lucide ou Emoji) com fallback seguro e dimensões consistentes.
 */
export function ContextualIconBadge({
  iconName,
  emoji,
  size = 20,
  color = '#ED7E13',
  className = '',
  style = {}
}) {
  if (emoji && typeof emoji === 'string' && emoji.trim()) {
    return (
      <span
        className={`contextual-emoji ${className}`}
        style={{
          fontSize: `${size}px`,
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...style
        }}
      >
        {emoji.trim()}
      </span>
    );
  }

  const IconComponent = CONTEXTUAL_ICONS_MAP[iconName] || CheckCircle2;

  return (
    <IconComponent
      size={size}
      color={color}
      className={`contextual-icon ${className}`}
      style={{
        flexShrink: 0,
        ...style
      }}
    />
  );
}
