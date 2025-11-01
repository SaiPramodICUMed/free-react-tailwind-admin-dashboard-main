import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";

// Interface matching your JSON structure
interface Task {
  TaskId: number;
  Name: string;
  Owner: string;
  CustomerSegment: string;
  Status: string;
  Value: number;
  TaskType: string;
  CountryName: string;
}

// Replace tableData with your JSON data
const tableData: Task[] = [
  {
    TaskId: 138669,
    Name: "P – 066156 – US MEDICAL SPECIALTIES (7)",
    Owner: "Greg Romer - ALT INF - South FL",
    CustomerSegment: "Distributor - Alternate Site",
    Status: "Declined",
    Value: 0.0,
    TaskType: "Price List",
    CountryName: "USA - Alt. Care",
  },
  {
    TaskId: 138891,
    Name: "P – 050085 – MCKESSON (33)",
    Owner: "Kelly Iisakka - CC - AZ, NV",
    CustomerSegment: "Distributor",
    Status: "Declined",
    Value: 7200.0,
    TaskType: "Price List",
    CountryName: "USA",
  },
  {
    TaskId: 139194,
    Name: "P – 063971 – SUN SURGICAL SUPPLY",
    Owner: "Greg Romer - ALT INF - South FL",
    CustomerSegment: "Distributor - Alternate Site",
    Status: "Declined",
    Value: 0.0,
    TaskType: "Price List",
    CountryName: "USA - Alt. Care",
  },
  {
    TaskId: 139844,
    Name: "P – 781130 – ACUTE MANAGEMENT GROUP (18)",
    Owner: "Greg Romer - ALT INF - South FL",
    CustomerSegment: "Distributor - Alternate Site",
    Status: "Declined",
    Value: 0.0,
    TaskType: "Price List",
    CountryName: "USA - Alt. Care",
  },
  {
    TaskId: 139602,
    Name: "Q – 2 Accounts – 046850, 046500",
    Owner: "Mark Sniffen - CC - Northern NJ, NYC, LI",
    CustomerSegment: "Hospital - Private/General",
    Status: "Declined",
    Value: 969696.0,
    TaskType: "Quote/Offer",
    CountryName: "USA",
  },
  {
    TaskId: 138591,
    Name: "P – 058665 – TRI-MED MEDICAL SUPPLIES (3)",
    Owner: "Dan Nagel",
    CustomerSegment: "Distributor - Alternate Site",
    Status: "Declined",
    Value: 0.0,
    TaskType: "Price List",
    CountryName: "USA - Alt. Care",
  },
  {
    TaskId: 140236,
    Name: "P – 639152 – A&M HOSPITAL SUPPLY",
    Owner: "Greg Romer - ALT INF - South FL",
    CustomerSegment: "Distributor - Alternate Site",
    Status: "Declined",
    Value: 0.0,
    TaskType: "Price List",
    CountryName: "USA - Alt. Care",
  },
  {
    TaskId: 139522,
    Name: "P – 781130 – ACUTE MANAGEMENT GROUP (17)",
    Owner: "Greg Romer - ALT INF - South FL",
    CustomerSegment: "Distributor - Alternate Site",
    Status: "Declined",
    Value: 12100.0,
    TaskType: "Price List",
    CountryName: "USA - Alt. Care",
  },
];

export default function BasicTableOne() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-blue-800">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Task ID
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Task Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Owner
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Customer Segment
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Country
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Value (USD)
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Customer Segment
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Country
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Value (USD)
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Customer Segment
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Country
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-large text-white text-start text-theme-xs dark:text-gray-400"
              >
                Value (USD)
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-xs">
            {tableData.map((task) => (
              <TableRow key={task.TaskId}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  {task.TaskId}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {task.Name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {task.Owner}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {task.CustomerSegment}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {task.CountryName}
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <Badge
                    size="sm"
                    color={
                      task.Status === "Declined"
                        ? "error"
                        : task.Status === "Active"
                        ? "success"
                        : "warning"
                    }
                  >
                    {task.Status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {task.Value.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {task.CustomerSegment}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {task.CountryName}
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <Badge
                    size="sm"
                    color={
                      task.Status === "Declined"
                        ? "error"
                        : task.Status === "Active"
                        ? "success"
                        : "warning"
                    }
                  >
                    {task.Status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {task.Value.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {task.CustomerSegment}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {task.CountryName}
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <Badge
                    size="sm"
                    color={
                      task.Status === "Declined"
                        ? "error"
                        : task.Status === "Active"
                        ? "success"
                        : "warning"
                    }
                  >
                    {task.Status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {task.Value.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
