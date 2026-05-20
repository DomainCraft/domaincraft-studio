import { useUIStore } from '@/stores/ui-store';
import EntityList from './EntityList';
import EnumManager from './EnumManager';
import ProjectSettings from './ProjectSettings';

const tabs = [
  { id: 'entities' as const, label: 'Entities' },
  { id: 'enums' as const, label: 'Enums' },
  { id: 'settings' as const, label: 'Settings' },
];

export default function Explorer() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {activeTab === 'entities' && <EntityList />}
        {activeTab === 'enums' && <EnumManager />}
        {activeTab === 'settings' && <ProjectSettings />}
      </div>
    </div>
  );
}
