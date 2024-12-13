import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import Formatter from "../../utilities/Formatter";
import CalculateClose from "../../utilities/CalculateClose";
import CalculateVolume from "../../utilities/CalculateVolume";
import NumberFormat from "../../utilities/NumberFormat";

export default function Area({ data, option }) {
  const [closeData, setCloseData] = useState([]);
  const [volumeGreenData, setVolumeGreenData] = useState([]);
  const [volumeRedData, setVolumeRedData] = useState([]);

  const [options, setOptions] = useState({
    chart: {
      height: 350,
      background: "#FFFFFF",
    },
    title: {
      text: "Area Chart",
      align: "left",
    },
    xaxis: {
      type: "category",
      categories: closeData.map((point) => point.x),
      labels: {
        formatter: function (val) {
          const date = new Date(val);
          return date.toLocaleString("en-US", {
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
        showDuplicates: false,
        style: {
          fontSize: "10px",
        },
      },
      tickAmount: 10,
    },
    yaxis: [
      {
        labels: {
          formatter: function (val) {
            return val.toFixed(2);
          },
        },
        title: {
          text: "Price",
        },
      },
      {
        opposite: true,
        labels: {
          formatter: function (val) {
            return NumberFormat(val);
          },
        },
        title: {
          text: "Volume",
        },
      },
    ],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#00C1D4"],
        inverseColors: false,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
      colors: ["#00005F"],
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 2,
      },
    },
  });

  useEffect(() => {
    const close = CalculateClose(data);
    setCloseData(close);

    const { greenVolumes, redVolumes } = CalculateVolume(data); 
    setVolumeGreenData(greenVolumes);
    setVolumeRedData(redVolumes);
  }, [data]);

  useEffect(() => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      xaxis: {
        ...prevOptions.xaxis,
        labels: {
          ...prevOptions.xaxis.labels,
          formatter: function (val) {
            return Formatter(val, option);
          },
        },
      },
    }));
  }, [option, closeData]);

  const series = [
    {
      name: "Price",
      type: "area",
      data: closeData,
      color: "#00005F",
    },
    {
      name: "Volume (Up)",
      type: "bar",
      data: volumeGreenData,
      color: "#00C853", 
    },
    {
      name: "Volume (Down)",
      type: "bar",
      data: volumeRedData,
      color: "#D50000", 
    },
  ];

  return (
    <div>
      <div id="chart">
        <ReactApexChart options={options} series={series} height={350} />
      </div>
    </div>
  );
}
