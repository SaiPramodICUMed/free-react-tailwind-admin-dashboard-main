import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useState } from "react";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
    const [actionAlerts, setActionAlerts] = useState(true);
    const [includeChangeSummary, setIncludeChangeSummary] = useState(true);
    const [emailComments, setEmailComments] = useState(true);
    const [summaryReport, setSummaryReport] = useState("No");
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Email
            </h4>
</div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1 lg:gap-7 2xl:gap-x-32">
              <div className="space-y-6">
      {/* Row: Requirement Alerts */}
      <EmailRow
        label="Requirement Alerts:"
        description="Emails to inform users when an approval decision is needed"
      >
        <div className="text-right">
          <span className="text-gray-700">Individual</span>
        </div>
      </EmailRow>

      {/* Row: Deadline Alerts */}
      <EmailRow
        label="Deadline Alerts:"
        description="Email to inform users when tasks have reached their deadline"
      >
        <div className="text-right">
          <span className="text-gray-700">Daily Summary</span>
        </div>
      </EmailRow>

      {/* Row: Action Alerts (checkbox on right) */}
      <EmailRow
        label="Action Alerts:"
        description="Emails detailing all approval actions (decline, approve, completed etc)"
      >
        <div className="text-right">
          <input
            type="checkbox"
            checked={actionAlerts}
            onChange={(e) => setActionAlerts(e.target.checked)}
            className="h-5 w-5 text-blue-600"
          />
        </div>
      </EmailRow>

      {/* Row: Summary Reports */}
      <EmailRow
        label="Summary Reports:"
        description="A summary (daily/weekly) of all above alerts"
      >
        <div className="text-right">
          <select
            value={summaryReport}
            onChange={(e) => setSummaryReport(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option>No</option>
            <option>Daily</option>
            <option>Weekly</option>
          </select>
        </div>
      </EmailRow>

      {/* Row: Include change summary */}
      <EmailRow label="Include change summary:" description="">
        <div className="text-right">
          <input
            type="checkbox"
            checked={includeChangeSummary}
            onChange={(e) => setIncludeChangeSummary(e.target.checked)}
            className="h-5 w-5 text-blue-600"
          />
        </div>
      </EmailRow>

      {/* Row: Comments */}
      <EmailRow label="Comments:" description="">
        <div className="text-right">
          <input
            type="checkbox"
            checked={emailComments}
            onChange={(e) => setEmailComments(e.target.checked)}
            className="h-5 w-5 text-blue-600"
          />
        </div>
      </EmailRow>

      {/* <div className="text-center">
        <button className="bg-blue-800 text-white px-5 py-2 rounded text-sm">Save</button>
      </div> */}
    </div>
              {/* <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Country
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  United States.
                </p>
              </div> */}

              {/* <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  City/State
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  Phoenix, Arizona, United States.
                </p>
              </div> */}

              {/* <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Postal Code
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  ERT 2489
                </p>
              </div> */}

              {/* <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  TAX ID
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  AS4568384
                </p>
              </div> */}
            </div>
          </div>

          <button
          //  onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Save
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Address
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Country</Label>
                  <Input type="text" value="United States" />
                </div>

                <div>
                  <Label>City/State</Label>
                  <Input type="text" value="Arizona, United States." />
                </div>

                <div>
                  <Label>Postal Code</Label>
                  <Input type="text" value="ERT 2489" />
                </div>

                <div>
                  <Label>TAX ID</Label>
                  <Input type="text" value="AS4568384" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

/* ------------------------- EMAIL ROW (3-column: label | desc | control) ------------------------- */
function EmailRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 items-start gap-4">
      {/* Label */}
      <div className="col-span-3">
        <p className="font-semibold text-gray-700 text-sm">{label}</p>
      </div>

      {/* Description (italic, muted) */}
      <div className="col-span-7">
        <p className="text-gray-600 italic text-sm">{description}</p>
      </div>

      {/* Control (right-aligned) */}
      <div className="col-span-2 flex justify-end items-center text-sm">{children}</div>
    </div>
  );
}