export default function PublicHeader() {
  return (
    <header className="border-b border-slate-400 bg-slate-100 px-4 py-3 shadow-sm sm:px-6 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 sm:gap-4">
        <img
          src="/maha-logo.png"
          className="h-12 w-auto shrink-0 object-contain sm:h-16 lg:h-24"
          alt="Maha Logo"
        />

        <div className="min-w-0 flex-1 text-center">
          <h1 className="text-sm font-bold uppercase tracking-wide sm:text-xl lg:text-3xl">
            Government of Maharashtra
          </h1>
          <p className="mt-1 text-[11px] font-medium text-slate-700 sm:text-sm lg:text-base">
            Other Backward Bahujan Welfare Department
          </p>
        </div>

        <img
          src="/maha2-logo.png"
          className="ml-auto h-12 w-auto shrink-0 object-contain sm:h-16 lg:h-24"
          alt="Maha Secondary Logo"
        />
      </div>
    </header>
  );
}
