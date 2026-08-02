import { Shield, FileText, Trash2, RefreshCw, Zap, Database } from 'lucide-react';
import type { FeatureId } from './features';

export const featureIcons: Record<FeatureId, React.ComponentType<{ size?: number; className?: string }>> = {
  audit: Shield,
  audit_log: FileText,
  soft_delete: Trash2,
  optimistic_lock: RefreshCw,
  event_sourced: Zap,
  cacheable: Database,
};
