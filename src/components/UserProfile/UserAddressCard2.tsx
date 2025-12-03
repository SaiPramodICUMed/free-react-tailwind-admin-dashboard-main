import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

export default function UserAddressCard2() {
  const user = useSelector((state: any) => state.user.users);
  const userId = user?.userId;

  const [loading, setLoading] = useState(true);
  const [usersByCountry, setUsersByCountry] = useState({});
  const [coverUsers, setCoverUsers] = useState({});
  const [coverMessage, setCoverMessage] = useState("");
  const [coverSetting, setCoverSetting] = useState("off"); // "off" | "on" | "auto"

  /* ---------------------------------------------------------
     LOAD UPPER-LEVEL USERS (same as before)
  --------------------------------------------------------- */
  const loadUpperLevelUsers = async () => {
    try {
      const res = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Login/GetUpperLevelUsers?userId=${userId}`
      );

      const data = res.data || [];
      const grouped: any = {};

      data.forEach((item: any) => {
        if (!grouped[item.countryName]) grouped[item.countryName] = [];
        grouped[item.countryName].push(item);
      });

      setUsersByCountry(grouped);

      // Init dropdown values
      const init: any = {};
      Object.keys(grouped).forEach((country) => {
        init[country] = "None";
      });

      setCoverUsers(init);
    } catch (err) {
      console.error("Error loading cover users:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
     LOAD SAVED COVER USERS (API 2)
  --------------------------------------------------------- */
  const loadSavedCoverUsers = async () => {
    const res = await axios.post(
      "https://vm-www-dprice01.icumed.com:5000/api/Login/GetUserCoverUsers",
      { userId }
    );

    const saved = res.data || [];

    // Transform into { "Germany": userId, "USA": userId }
    const mapping: any = {};

    saved.forEach((c: any) => {
      if (c.countryId === -1) return; // ignore dummy row
      const country = Object.keys(usersByCountry).find(
        (x) =>
          usersByCountry[x].some(
            (u: any) => u.countryId === c.countryId
          )
      );
      if (country) {
        mapping[country] = c.coverUserId > 0 ? c.coverUserId : "None";
      }
    });

    setCoverUsers((prev: any) => ({ ...prev, ...mapping }));
  };

  /* ---------------------------------------------------------
     LOAD ON PAGE OPEN
  --------------------------------------------------------- */
  useEffect(() => {
    if (userId) {
      loadUpperLevelUsers();
    }
  }, [userId]);

  // Load saved cover users AFTER dropdowns are loaded
  useEffect(() => {
    if (Object.keys(usersByCountry).length > 0) {
      loadSavedCoverUsers();
    }
  }, [usersByCountry]);

  /* ---------------------------------------------------------
     LOAD COVER MESSAGE + COVER MODE FROM REDUX
  --------------------------------------------------------- */
  useEffect(() => {
    if (user) {
      setCoverMessage(user.coverMessage ?? "");
      setCoverSetting(
        user.coverMode === 1 ? "on" : user.coverMode === 2 ? "auto" : "off"
      );
    }
  }, [user]);

  /* ---------------------------------------------------------
     SAVE HANDLER
  --------------------------------------------------------- */
  const handleSave = async () => {
    try {
      // Convert UI "off|on|auto" → numeric mode
      const modeValue = coverSetting === "on" ? 1 : coverSetting === "auto" ? 2 : 0;

      // STEP 1 — Save cover message + mode
      await axios.post(
        "https://vm-www-dprice01.icumed.com:5000/api/Login/UpdateUserOutOfOfficeSettings",
        {
          userID: userId,
          coverMessage: coverMessage,
          coverMode: modeValue
        }
      );

      // STEP 2 — Save each cover user (loop)
      for (const country of Object.keys(usersByCountry)) {
        const countryId = usersByCountry[country][0]?.countryId; // get countryId

        await axios.post(
          "https://vm-www-dprice01.icumed.com:5000/api/Login/SetUserCoverUser",
          {
            userId,
            countryId,
            coverUserId:
              coverUsers[country] === "None" ? 0 : Number(coverUsers[country])
          }
        );
      }

      alert("Out of Office settings updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving settings");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-700">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
        Out of Office
      </h4>

      <div className="grid grid-cols-12 gap-y-8 w-full">

        {/* COVER USER TITLE */}
        <div className="col-span-3 font-semibold text-gray-700 text-sm pt-1">
          Cover User:
        </div>

        {/* COUNTRY + DROPDOWN */}
        <div className="col-span-9 space-y-4">
          {Object.keys(usersByCountry).map((country) => (
            <div key={country} className="flex items-center gap-6">
              <div className="w-32 text-gray-700">{country}</div>

              <select
                className="border rounded px-3 py-1 text-sm w-60"
                value={coverUsers[country] ?? "None"}
                onChange={(e) =>
                  setCoverUsers((prev) => ({
                    ...prev,
                    [country]: e.target.value
                  }))
                }
              >
                <option value="None">None</option>

                {usersByCountry[country].map((u: any) => (
                  <option key={u.userId} value={u.userId}>
                    {u.userName?.trim()} ({u.approvalName})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* COVER MESSAGE */}
        <div className="col-span-3 font-semibold text-gray-700 text-sm">
          Cover Message:
        </div>

        <div className="col-span-9">
          <textarea
            className="border rounded px-3 py-2 w-[350px] h-28 text-sm"
            value={coverMessage}
            onChange={(e) => setCoverMessage(e.target.value)}
          />
        </div>

        {/* COVER SETTING */}
        <div className="col-span-3 font-semibold text-gray-700 text-sm pt-1">
          Cover Setting:
        </div>

        <div className="col-span-9 flex items-center gap-10 text-sm">
          {["off", "on", "auto"].map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="radio"
                checked={coverSetting === option}
                onChange={() => setCoverSetting(option)}
              />
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
