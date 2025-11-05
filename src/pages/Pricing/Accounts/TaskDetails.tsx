import React, { useState } from "react";

const TaskDetails: React.FC = () => {
  const [validFrom, setValidFrom] = useState<string>("immediately");
  const [validFromDate, setValidFromDate] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("1year");
  const [validUntilDate, setValidUntilDate] = useState<string>("");

  const [customer, setCustomer] = useState({
    name: "",
    telephone: "",
    email: "",
    address: "",
    reference: "",
  });

  const handleCustomerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      validFrom,
      validFromDate,
      validUntil,
      validUntilDate,
      customer,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto bg-white p-6 border border-gray-200 rounded-md shadow-sm mt-6"
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        Task Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Price List Details */}
        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-semibold text-blue-700 mb-3 border-b pb-1">
            Price List Details
          </h3>

          {/* Valid From */}
          <div className="mb-4">
            <label className="block font-medium text-gray-600 mb-2">
              Valid From:
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="validFrom"
                  value="immediately"
                  checked={validFrom === "immediately"}
                  onChange={() => setValidFrom("immediately")}
                />
                <span>Immediately</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="validFrom"
                  value="date"
                  checked={validFrom === "date"}
                  onChange={() => setValidFrom("date")}
                />
                <input
                  type="date"
                  value={validFromDate}
                  onChange={(e) => setValidFromDate(e.target.value)}
                  className="border rounded p-1 text-sm"
                  disabled={validFrom !== "date"}
                />
              </label>
            </div>
          </div>

          {/* Valid Until */}
          <div>
            <label className="block font-medium text-gray-600 mb-2">
              Valid Until:
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="validUntil"
                  value="1year"
                  checked={validUntil === "1year"}
                  onChange={() => setValidUntil("1year")}
                />
                <select
                  value="1year"
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="border rounded p-1 text-sm"
                  disabled={validUntil !== "1year"}
                >
                  <option value="1year">1 year</option>
                  <option value="6months">6 months</option>
                  <option value="2years">2 years</option>
                </select>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="validUntil"
                  value="date"
                  checked={validUntil === "date"}
                  onChange={() => setValidUntil("date")}
                />
                <input
                  type="date"
                  value={validUntilDate}
                  onChange={(e) => setValidUntilDate(e.target.value)}
                  className="border rounded p-1 text-sm"
                  disabled={validUntil !== "date"}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Customer Details */}
        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-semibold text-blue-700 mb-3 border-b pb-1">
            Customer Details
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-medium text-gray-600 mb-1">
                Name:
              </label>
              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleCustomerChange}
                className="w-full border rounded p-1 text-sm"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-600 mb-1">
                Telephone:
              </label>
              <input
                type="text"
                name="telephone"
                value={customer.telephone}
                onChange={handleCustomerChange}
                className="w-full border rounded p-1 text-sm"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-600 mb-1">
                Email:
              </label>
              <input
                type="email"
                name="email"
                value={customer.email}
                onChange={handleCustomerChange}
                className="w-full border rounded p-1 text-sm"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-600 mb-1">
                Address:
              </label>
              <textarea
                name="address"
                rows={2}
                value={customer.address}
                onChange={handleCustomerChange}
                className="w-full border rounded p-1 text-sm resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block font-medium text-gray-600 mb-1">
                Reference:
              </label>
              <input
                type="text"
                name="reference"
                value={customer.reference}
                onChange={handleCustomerChange}
                className="w-full border rounded p-1 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default TaskDetails;
