import { useEffect, useState } from "react";
import axios from "axios";

export default function TeamAlertsModal({ userId, onClose, isOpen, onSaved }: any) {
  const [data, setData] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<Record<number, number>>({});
  const [rightSideValue, setRightSideValue] = useState<Record<number, number[]>>({});
  const [settingValue, setSettingValue] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);

  const loadTeamAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Login/getUserTeamSettings?userID=${userId}`
      );
      const payload = res.data ?? [];
      setData(payload);

      const leftInit: Record<number, number> = {};
      const rightInit: Record<number, number[]> = {};
      const setInit: Record<number, number> = {};

      payload.forEach((row: any) => {
        if (!leftInit[row.countryId]) leftInit[row.countryId] = row.approvalId;

        if (row.selected) {
          if (!Array.isArray(rightInit[row.countryId])) rightInit[row.countryId] = [];
          rightInit[row.countryId].push(row.approvalId);
        }

        // static right dropdown (None / Individual / Summary)
        if (!setInit[row.countryId]) {
          setInit[row.countryId] = row.setting ?? -1;
        }
      });

      setSelectedRole(leftInit);
      setRightSideValue(rightInit);
      setSettingValue(setInit);
    } catch (err) {
      console.error("Team alert load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadTeamAlerts();
  }, [isOpen]);

  const handleAdd = (countryId: number) => {
    const role = selectedRole[countryId];
    if (!role) return;

    setRightSideValue((prev) => {
      const existing = Array.isArray(prev[countryId]) ? prev[countryId] : [];
      if (existing.includes(role)) return prev;

      return {
        ...prev,
        [countryId]: [...existing, role],
      };
    });
  };

  const removeRole = (countryId: number, approvalId: number) => {
    setRightSideValue((prev) => ({
      ...prev,
      [countryId]: prev[countryId].filter((id) => id !== approvalId),
    }));
  };

  const handleSave = async () => {
    const teamAlerts = data.map((item) => ({ ...item }));

    teamAlerts.forEach((item) => {
      const selectedRoles = rightSideValue[item.countryId] ?? [];

      if (selectedRoles.includes(item.approvalId)) {
        item.selected = true;
        item.setting = settingValue[item.countryId]; // static dropdown value
      } else {
        item.selected = false;
        item.setting = -1;
      }
    });

    let xml = `<settings>`;
    teamAlerts.forEach((t) => {
      xml += `
        <setting>
          <approvalID>${t.approvalId}</approvalID>
          <value>${t.setting}</value>
          <selected>${t.selected}</selected>
        </setting>`;
    });
    xml += `</settings>`;

    try {
      await axios.post(
        "https://vm-www-dprice01.icumed.com:5000/api/Login/UpdateUserTeamSettings",
        { userId, settingsXml: xml },
        { headers: { "Content-Type": "application/json" } }
      );

      alert("Team alerts updated");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      alert("Error updating team alerts");
    }
  };

  if (!isOpen) return null;
  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const countries = [...new Map(data.map((i) => [i.countryId, i])).values()];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-xl p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[85vh] overflow-y-auto p-6">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Team Alerts</h2>
          <button onClick={onClose} className="text-gray-500 text-3xl hover:text-gray-700">
            ×
          </button>
        </div>

        <div className="grid grid-cols-12 font-semibold mb-2 text-gray-700">
          <div className="col-span-2">Country</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-1"></div>
          <div className="col-span-2">Setting</div>
          <div className="col-span-4">Selected</div>
        </div>

        {countries.map((c: any) => {
          const roles = data.filter((x) => x.countryId === c.countryId);
          const selectedList = rightSideValue[c.countryId] ?? [];

          return (
            <div key={c.countryId} className="py-4 border-b">
              <div className="grid grid-cols-12 gap-3 items-center">

                <div className="col-span-2 font-medium">{c.countryName}</div>

                <div className="col-span-3">
                  <select
                    className="border p-2 rounded-md w-full"
                    value={selectedRole[c.countryId] ?? ""}
                    onChange={(e) =>
                      setSelectedRole((prev) => ({
                        ...prev,
                        [c.countryId]: Number(e.target.value),
                      }))
                    }
                  >
                    {roles.map((r) => (
                      <option key={r.approvalId} value={r.approvalId}>
                        {r.approvalName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <button
                    onClick={() => handleAdd(c.countryId)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>

                {/* STATIC RIGHT-SIDE DROPDOWN */}
                <div className="col-span-2">
                  <select
                    className="border p-2 rounded-md w-full"
                    value={settingValue[c.countryId] ?? -1}
                    onChange={(e) =>
                      setSettingValue((prev) => ({
                        ...prev,
                        [c.countryId]: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={-1}>None</option>
                    <option value={0}>Individual Alerts</option>
                    <option value={1}>Summary Reports</option>
                  </select>
                </div>

                <div className="col-span-4">
                  {selectedList.length === 0 && <p className="text-gray-400 text-sm">None</p>}

                  {selectedList.map((id) => {
                    const role = roles.find((r) => r.approvalId === id);
                    return (
                      <div
                        key={id}
                        className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded mt-1"
                      >
                        <span>{role?.approvalName ?? id}</span>
                        <button
                          onClick={() => removeRole(c.countryId, id)}
                          className="text-red-500 font-bold text-lg ml-3"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          );
        })}

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="border px-5 py-2 rounded hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
