interface FormSectionProps {
  label: string;
  children: React.ReactNode;
}

export default function FormSection({ label, children }: FormSectionProps) {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
