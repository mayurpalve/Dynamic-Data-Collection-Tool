export default function Card({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">

      <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
        {value}
      </p>

    </div>
  );
}
