import React, { useEffect } from "react";

const VennData = ({ onDataLoaded }) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("./venn_out_data (1).txt");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const text = await response.text();
        const rows = text.trim().split("\n");
        const headers = rows.shift().split("\t"); // Assuming headers are in the first row
        const data = rows.map((row) => {
          const values = row.split("\t");
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });

        const uniqueA = data.filter((item) => item["Unique A"] !== "NA").length;
        const uniqueB = data.filter((item) => item["Unique B"] !== "NA").length;
        const commonAB = data.filter(
          (item) => item["Common A B"] !== "NA"
        ).length;

        onDataLoaded({ uniqueA, uniqueB, commonAB });
      } catch (error) {
        console.error("Error fetching the Venn diagram data:", error);
      }
    };

    fetchData();
  }, [onDataLoaded]);

  return null;
};

export default VennData;
