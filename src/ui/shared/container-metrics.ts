export type Dataset = {
  label?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
  data: number[];
};

export const processDataSeries = ({
  colDataSeries,
  colName,
}: { colDataSeries: any; colName: string }) => {
  const dataSeries: Dataset = {
    label: colName,
    pointRadius: 0,
    pointHoverRadius: 5,
    data: [],
  };
  colDataSeries.forEach(
    (elem: string | number | undefined | null, idx: number) => {
      if (idx === 0) return;
      if (typeof elem !== "number") return;
      dataSeries.data.push(elem);
    },
  );

  return dataSeries;
};
