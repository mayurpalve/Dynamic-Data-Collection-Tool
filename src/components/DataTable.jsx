export default function DataTable({ columns, data, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-300 bg-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-800 sm:px-6"
                >
                  {col.label}
                </th>
              ))}

              {onDelete && (
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-800 sm:px-6">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-6 text-center font-medium text-slate-600 sm:px-6"
                >
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-200 hover:bg-slate-50 last:border-none"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 align-top text-slate-900 sm:px-6">
                      {row[col.key]}
                    </td>
                  ))}

                  {onDelete && (
                    <td className="px-4 py-3 text-right sm:px-6">
                      <button
                        onClick={() => onDelete(row.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
