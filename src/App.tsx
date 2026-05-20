import { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useUIStore } from '@/stores/ui-store';

export default function App() {
  const darkMode = useUIStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return <AppLayout />;
}
