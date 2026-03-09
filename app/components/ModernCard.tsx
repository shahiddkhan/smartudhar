interface Props {
  title: string;
  value?: string | number;
  children?: React.ReactNode;
}

export default function ModernCard({ title, value, children }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 border border-slate-200">
      <p className="text-sm text-slate-500 mb-1">{title}</p>

      {value && <p className="text-2xl font-bold text-slate-900">{value}</p>}

      {children}
    </div>
  );
}
