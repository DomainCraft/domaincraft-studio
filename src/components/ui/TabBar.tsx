import Button from '@/components/ui/Button';

interface Tab {
  id: string;
  label: string;
}

interface TabBarProps<T extends string = string> {
  tabs: Tab[];
  activeTab: T;
  onChange: (id: T) => void;
}

export default function TabBar<T extends string = string>({ tabs, activeTab, onChange }: TabBarProps<T>) {
  return (
    <div className="flex border-b border-themed">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          onClick={() => onChange(tab.id as T)}
          className={`flex-1 px-3 py-2 rounded-none font-medium ${
            tab.id === activeTab
              ? 'border-b-2 border-blue-500 text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
