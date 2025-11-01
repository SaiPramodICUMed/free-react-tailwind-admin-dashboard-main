import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";


import PageMeta from "../../components/common/PageMeta";
import BasicTables from "../Tables/BasicTables";

export default function Trash() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-6 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart page={'Trash'}/>
        </div>

        
        
        <div className="col-span-12 mt-8">
          <BasicTables page={'Trash'} />
        </div>

        
      </div>
    </>
  );
}
