import { useEffect, Component, type ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useUIStore } from '@/stores/ui-store';
import Button from '@/components/ui/Button';

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center h-screen w-screen bg-background text-foreground p-8">
            <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm"
            >
              Reload page
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const darkMode = useUIStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  );
}
