import { useState } from "react";

export default function Talukas() {
  const [talukas, setTalukas] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    setTalukas(prev => [...prev, { id: Date.now(), name }]);
    setName("");
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this taluka?")) return;
    setTalukas(prev => prev.filter(t => t.id !== id));
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setEditingName(t.name);
  };

  const handleUpdate = () => {
    if (!editingName.trim()) return;
    setTalukas(prev =>
      prev.map(t =>
        t.id === editingId ? { ...t, name: editingName } : t
      )
    );
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Talukas</h2>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Taluka Name"
          className="w-full rounded border px-3 py-2 sm:max-w-xs"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <div className="overflow-hidden rounded border">
        <div className="grid grid-cols-2 bg-gray-100 px-4 py-2 font-semibold">
          <span>Taluka Name</span>
          <span className="text-right">Actions</span>
        </div>

        {talukas.length === 0 ? (
          <div className="px-4 py-4 text-gray-500">No talukas found</div>
        ) : (
          talukas.map(t => (
            <div
              key={t.id}
              className="grid grid-cols-1 gap-3 border-t px-4 py-3 sm:grid-cols-2 sm:items-center"
            >
              {editingId === t.id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full rounded border px-2 py-1 sm:max-w-[15rem]"
                />
              ) : (
                <span>{t.name}</span>
              )}

              <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
                {editingId === t.id ? (
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
                      onClick={() => handleEdit(t)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
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
