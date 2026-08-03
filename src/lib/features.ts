import { SPECMETA } from '@/lib/specmeta';
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
  event_sourced: { label: 'Event Sourced', color: 'bg-cyan-500' },
  cacheable: { label: 'Cacheable', color: 'bg-orange-500' },
};

export interface FeatureOption extends FeatureConfig {
  id: FeatureId;
}

// Feature list comes from core specmeta (via the WASM binary), so an id that is
// not known yet gets a safe fallback label/color.
const FALLBACK_CONFIG: FeatureConfig = { label: 'Feature', color: 'bg-gray-500' };

export function getFeatureOptions(): FeatureOption[] {
  return SPECMETA.features.map((id) => ({
    id: id as FeatureId,
    ...(featureConfig[id as FeatureId] ?? FALLBACK_CONFIG),
  }));
}