export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-5 border-b border-slate-300 pb-4">

      <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">
        {title}
      </h1>

      {subtitle && (
        <p className="mt-1 max-w-3xl text-sm font-medium text-slate-700">
          {subtitle}
        </p>
      )}

    </div>
  );
}
