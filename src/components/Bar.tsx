import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const Bar: React.FC = () => {
  const Data: any = {
    approvalNames: [
      "Testing","Calendar Access","Scandinavia MD","Data Centre","Strategic Business Unit",
      "Test Approval1","Supper Users","Supper User","Regional Manager","Regional Finance",
      "Customer Service Assistant","Account Manager","Sales Person","Inside Sales support",
      "Sales Representative","Sales Manager","Regional Business Manager","Senior Business Manager",
      "Pricing Team","Customer Services","Strategic Business Manager","Strategic Business Manager 1",
      "Strategic Business Manager 2","Strategic Business Manager 3","Strategic Business Manager 4",
      "Distributor Manager","HSM","Executive Account Manager","Custom Kit Manager","Country Finance",
      "Country MD","European Finance","Sales Specialist","Marketing Manager","Health Care Manager",
      "European Director","Super User","Placed Hardware Manager","Cover to Finance Business Partner",
      "Finance Business Partner","Director, Corporate Accounts","Contracts","VP Sales US","VP Sales",
      "Americas Finance Director","NORDACH Sales","Country MD TEMP","VP Americas Sales",
      "Belgium Sales Director","Netherlands Sales Director","National Sales","France Sales Director",
      "Regional Marketing Director","DACH Sales","Finance SEMEA","SEMEA Finance",
      "EMEA Sales Operations Manager","EMEA Finance","Director SEMEA","EMEA VP","Test Approval",
      "Pricing Coordinator","Contracts team","Service Clients"
    ],
    urgentTasksCount: new Array(63).fill(0),
    thisWeekTasksCount: new Array(63).fill(0),
    laterTasks: [
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,1389.747323,0,0,0,0,62603.109538,1730.904048,0,0,0,0,0,0,0,0,
      286.980634,192956.986331,865915.863982,151133.309431
    ],
  };

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 450,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true },
      parentHeightOffset: 60,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: Data.approvalNames,
      labels: {
        rotate: -45, // full vertical labels
        rotateAlways: true,
        style: {
          fontSize: "10px",
          colors: Array(Data.approvalNames.length).fill("#003366"),
        },
      },
      tickPlacement: "on",
      axisBorder: { show: true, color: "#0077cc" },
      axisTicks: { show: true, color: "#0077cc" },
    },
    yaxis: {
      forceNiceScale: true,
      decimalsInFloat: 0,
      title: {
        text: "Values (auto-scaled)",
        style: { color: "#003366" },
      },
      labels: { style: { colors: "#003366" } },
    },
    grid: { borderColor: "#dce6f1", strokeDashArray: 4 ,padding: {
        bottom: 80, // extra space for labels
      }},
    legend: {
      position: "top",
      horizontalAlign: "center",
      labels: { colors: "#004b9b" },
    },
    colors: ["#ff0000", "#ffbf00", "#0000ff"],
    tooltip: {
      theme: "light",
      y: { formatter: (val) => val.toLocaleString() },
    },
  };

  const series = [
    { name: "Late", data: Data.laterTasks },
    { name: "Awaiting", data: Data.thisWeekTasksCount },
    { name: "Priority", data: Data.urgentTasksCount },
  ];

  return (
    <div
      style={{
        backgroundColor: "#f4f8ff",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 3px 15px rgba(0,0,80,0.1)",
          width: "95%",
          maxWidth: "1200px",
          overflowX: "auto", // enables horizontal scroll
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#004b9b",
            marginBottom: "25px",
          }}
        >
          Approval Tasks Overview
        </h2>

        {/* Chart inside scrollable div */}
        <div style={{ minWidth: "1500px" }}>
          <Chart options={options} series={series} type="bar" height={500} />
        </div>
      </div>
    </div>
  );
};

export default Bar;
