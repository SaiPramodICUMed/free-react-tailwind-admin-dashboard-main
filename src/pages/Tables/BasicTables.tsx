// import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import BasicTableTwo from "../../components/tables/BasicTables/BasicTableTwo";
import BasicTableWithFIlter from "../../components/tables/BasicTables/BasicTableWithFIlter";
//import BasicTableWithFIlter from "../../components/tables/BasicTables/BasicTableWithFIlter";

interface MyComponentProps {
  page: string;
  inboxData: [];
  columns: []; // optional
  checkBox?: boolean;
  setSelectedRows?: (rows: any) => void;
  handleViewDetails?: (row: any) => void;
  viewDetails?: boolean;
   handleCreate?:(row:any)=>void;
   createOption?:boolean;
   //={handleCreate} createOption={true}
}


export default function BasicTables({page,inboxData,columns,checkBox,setSelectedRows,handleViewDetails,viewDetails,handleCreate,createOption}: MyComponentProps) {
 // const [selected, setSelected] =  useState<any[]>([]);
 // console.log("tabledata",selected);
  return (
    
    <>
      <PageMeta
        title="Pricing Tool"
        description=""
      />
      {/* {selected.length} */}
      {/* <PageBreadcrumb pageTitle = {`${page} - Data`} /> */}
      <div className="space-y-6">       
        {checkBox ? <BasicTableTwo columns={columns} data={inboxData} setSelected={setSelectedRows} viewDetails={viewDetails} handleViewDetails={handleViewDetails} handleCreate={handleCreate} createOption={createOption}/> :
          <BasicTableOne columns={columns} data={inboxData} />}
          {/* <BasicTableWithFIlter columns={columns} data={inboxData} /> */}
       
      </div>
    </>
  );
}
