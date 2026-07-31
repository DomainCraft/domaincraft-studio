import { useUIStore } from '@/stores/ui-store';
import EntityList from './EntityList';
import EnumManager from './EnumManager';
import ProjectSettings from './ProjectSettings';
import TabBar from '@/components/ui/TabBar';

const tabs = [
  { id: 'entities', label: 'Entities' },
  { id: 'enums', label: 'Enums' },
  { id: 'settings', label: 'Settings' },
];

export default function Explorer() {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  return (
    <div className="flex flex-col h-full">
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {activeTab === 'entities' && <EntityList />}
        {activeTab === 'enums' && <EnumManager />}
        {activeTab === 'settings' && <ProjectSettings />}
      </div>
    </div>
  );
}
