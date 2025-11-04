import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import BasicTableTwo from "../../components/tables/BasicTables/BasicTableTwo";

interface MyComponentProps {
  page: string;
  inboxData: [];
  columns: []; // optional
  checkBox?: boolean;
  setSelectedRows?: (rows: any) => void;
}


export default function BasicTables({page,inboxData,columns,checkBox,setSelectedRows}: MyComponentProps) {
 // const [selected, setSelected] =  useState<any[]>([]);
 // console.log("tabledata",selected);
  return (
    
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      {/* {selected.length} */}
      <PageBreadcrumb pageTitle = {`${page} - Data`} />
      <div className="space-y-6">
        {/* <ComponentCard title="Basic Table 1"> */}
        {checkBox ? <BasicTableTwo columns={columns} data={inboxData} setSelected={setSelectedRows}/> :
          <BasicTableOne columns={columns} data={inboxData} />}
        {/* </ComponentCard> */}
      </div>
    </>
  );
}
