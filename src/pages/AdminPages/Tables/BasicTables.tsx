import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import BasicTableOne from "./BasicTableOne";
import BasicTableTwo from "./BasicTableTwo";

interface MyComponentProps {
  page: string;
  inboxData: any[];
  columns: any[];
  checkBox?: boolean;
  setSelectedRows?: (rows: any) => void;
  enableFilters?: boolean;
  filterableColumns?: string[];
  onColumnFilterChange?: (filters: Record<string, string>) => void;
  columnFilters?: Record<string, string>;
  resetDateFilterTrigger?: number;
  sortConfig?: { column: string; direction: "asc" | "desc" } | null;
  onSortChange?: (sort: { column: string; direction: "asc" | "desc" } | null) => void;
}

export default function BasicTables(props: MyComponentProps) {
  const {
    page, inboxData, columns, checkBox, setSelectedRows, enableFilters,
    filterableColumns, onColumnFilterChange, columnFilters, resetDateFilterTrigger,
    sortConfig, onSortChange
  } = props;

  return (
    <>
      <PageMeta title={`${page} | Data Table`} description={`Data view for ${page}`} />
      <PageBreadcrumb pageTitle={`${page} - Data`} />

      <div className="space-y-6">
        {checkBox ? (
          <BasicTableTwo columns={columns} data={inboxData} setSelected={setSelectedRows} />
        ) : (
          <BasicTableOne
            columns={columns}
            data={inboxData}
            enableFilters={enableFilters}
            filterableColumns={filterableColumns}
            onFilterChange={onColumnFilterChange}
            externalFilters={columnFilters}
            resetDateFilterTrigger={resetDateFilterTrigger}
            sortConfig={sortConfig}
            onSortChange={onSortChange}
          />
        )}
      </div>
    </>
  );
}
