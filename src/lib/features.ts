import { FEATURES } from './constants';
import type { EntityDefinition } from '@/types/domain';

export type FeatureId = NonNullable<EntityDefinition['features']>[number];

export interface FeatureConfig {
  label: string;
  color: string;
}

export const featureConfig: Record<FeatureId, FeatureConfig> = {
  audit: { label: 'Audit', color: 'bg-blue-500' },
  audit_log: { label: 'Audit Log', color: 'bg-purple-500' },
  soft_delete: { label: 'Soft Delete', color: 'bg-amber-500' },
  optimistic_lock: { label: 'Optimistic Lock', color: 'bg-green-500' },
};

export const featureOptions = FEATURES.map((id) => ({
  id,
  ...featureConfig[id],
}));
