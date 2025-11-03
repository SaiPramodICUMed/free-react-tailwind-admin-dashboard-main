import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

interface MyComponentProps {
  page: string;
  inboxData: [];
  columns: []; // optional
}


export default function BasicTables({page,inboxData,columns}: MyComponentProps) {
  console.log("tabledata",columns);
  return (
    
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle = {`${page} - Data`} />
      <div className="space-y-6">
        {/* <ComponentCard title="Basic Table 1"> */}
          <BasicTableOne columns={columns} data={inboxData} />
        {/* </ComponentCard> */}
      </div>
    </>
  );
}
