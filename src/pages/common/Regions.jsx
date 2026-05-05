import { useState } from "react";

export default function Regions() {
  const [regions, setRegions] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    setRegions(prev => [...prev, { id: Date.now(), name }]);
    setName("");
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this region?")) return;
    setRegions(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setEditingName(r.name);
  };

  const handleUpdate = () => {
    if (!editingName.trim()) return;
    setRegions(prev =>
      prev.map(r =>
        r.id === editingId ? { ...r, name: editingName } : r
      )
    );
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Regions</h2>

      {/* ADD */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Region Name"
          className="w-full rounded border px-3 py-2 sm:max-w-xs"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded border">
        <div className="grid grid-cols-2 bg-gray-100 px-4 py-2 font-semibold">
          <span>Region Name</span>
          <span className="text-right">Actions</span>
        </div>

        {regions.length === 0 ? (
          <div className="px-4 py-4 text-gray-500">No regions found</div>
        ) : (
          regions.map(r => (
            <div
              key={r.id}
              className="grid grid-cols-1 gap-3 border-t px-4 py-3 sm:grid-cols-2 sm:items-center"
            >
              {editingId === r.id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full rounded border px-2 py-1 sm:max-w-[15rem]"
                />
              ) : (
                <span>{r.name}</span>
              )}

              <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
                {editingId === r.id ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(r)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
