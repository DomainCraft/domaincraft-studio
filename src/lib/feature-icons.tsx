import { Shield, FileText, Trash2, RefreshCw } from 'lucide-react';
import type { FeatureId } from './features';

export const featureIcons: Record<FeatureId, React.ComponentType<{ size?: number; className?: string }>> = {
  audit: Shield,
  audit_log: FileText,
  soft_delete: Trash2,
  optimistic_lock: RefreshCw,
};
