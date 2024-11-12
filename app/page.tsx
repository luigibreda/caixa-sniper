"use client";

import { useState, useMemo } from "react";

import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/table";
import { Pagination } from "@nextui-org/pagination";
import { Button } from "@nextui-org/button";
import Papa from "papaparse";
import { title, subtitle } from "@/components/primitives";
import { FaCloudUploadAlt } from 'react-icons/fa';

interface CsvRow {
  [key: string]: string | number;
}

export default function Home() {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [filteredData, setFilteredData] = useState<CsvRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleFileUpload = (file: File) => {
    if (!file) return;  // Verifica se o arquivo não é null ou undefined
  
    Papa.parse(file, {
      complete: (result) => {
        if (result.errors.length > 0) {
          setError("Erro ao processar o CSV");
        } else {
          setCsvData(result.data as CsvRow[]);
          setFilteredData(result.data as CsvRow[]);
          setError(null);
        }
      },
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      encoding: "UTF-8",
    });
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFilterChange = (column: string, value: string) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, [column]: value };
      applyFilters(newFilters);
      return newFilters;
    });
  };

  const applyFilters = (filters: { [key: string]: string }) => {
    let filtered = csvData;

    Object.keys(filters).forEach((column) => {
      const filterValue = filters[column].toLowerCase();
      if (filterValue) {
        filtered = filtered.filter((row) =>
          String(row[column]).toLowerCase().includes(filterValue)
        );
      }
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setFilteredData(csvData);
  };

  const handleSort = (column: string) => {
    const newSortOrder = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newSortOrder);

    const sortedData = [...filteredData].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (typeof valueA === "string" && typeof valueB === "string") {
        return newSortOrder === "asc"
          ? valueA.localeCompare(valueB, "pt-BR", { numeric: true })
          : valueB.localeCompare(valueA, "pt-BR", { numeric: true });
      } else if (typeof valueA === "number" && typeof valueB === "number") {
        return newSortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }
      return 0;
    });

    setFilteredData(sortedData);
  };

  const handleExport = () => {
    const csv = Papa.unparse(filteredData, { delimiter: ";" });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dados.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [currentPage, filteredData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-10">

<div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>CAIXA&nbsp;</span>
        <span className={title({ color: "violet" })}>SNIPER&nbsp;</span>
        <br />
        {/* <span className={title()}>
          websites regardless of your design experience.
        </span> */}
        <div className={`${subtitle({ class: "mt-4" })} w-full md:w-1/2 my-2 text-lg lg:text-xl text-default-600 block max-w-full !w-full mt-4 font-bold uppercase text-sm`}>
            Sistema de consultas de imóveis automatizado.
          </div>
      </div>

      {/* <div className="text-center max-w-xl mx-auto">
        <span className="text-3xl font-semibold">CAIXA&nbsp;</span>
        <span className={title({ color: "violet" })}>SNIPER&nbsp;</span>
        <div className="text-xl uppercase">
          <small>Sistema de consultas de imóveis automatizado.</small>
        </div>
      </div> */}
 {csvData.length === 0 && (
  <div
    className="flex flex-col items-center justify-center gap-4 mt-8 border-2 border-dashed border-gray-400 p-6 rounded-lg w-full max-w-md"
    onDragOver={(e) => e.preventDefault()}
    onDrop={handleFileDrop}
  >
    <input
      id="file-input"
      type="file"
      accept=".csv"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);  // Chama apenas se o arquivo for válido
      }}
      className="hidden"
    />
    
    {/* Logo no centro */}
    <div className="flex items-center justify-center w-full">
      <FaCloudUploadAlt className="animate-pulse text-6xl text-secondary" />
    </div>
    
    {/* Texto abaixo da logo */}
    <p className="text-center text-lg font-bold text-secondary tracking-wide">
      Arraste e solte o arquivo CSV...
    </p>
    
    {/* Botão de importação */}
    <button
      onClick={() => document.getElementById("file-input")?.click()}
      className="bg-secondary text-white px-4 py-2 rounded-md focus:outline-none"
    >
      IMPORTAR CSV
    </button>
    
    {error && <div className="text-red-500">{error}</div>}
  </div>
)}
      {csvData.length > 0 && (
        <div className="mt-8 w-full h-full overflow-hidden">
        <div className="flex justify-between mb-4">

    <div className="flex gap-4">
            {Object.keys(csvData[0]).map((column) =>
              column.includes("Modalidade de venda") || column.includes("Bairro") || column.includes("Cidade") ? (
                <select
                  key={column}
                  value={filters[column] || ""}
                  onChange={(e) => handleFilterChange(column, e.target.value)}
                  className="p-1 mr-2 text-gray max-w-[250px]"
                >
                  <option value="">{column}</option>
                  {Array.from(new Set(csvData.map((row) => row[column]))).map((value, index) => (
                    <option key={index} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              ) : null
            )}
            </div>

    <div className="flex gap-4">
            <Button onClick={clearFilters} variant="flat"  className="">
              Limpar Filtros
            </Button>
                      {/* Botão de Exportar */}
                      <Button
  onClick={handleExport}
  color="secondary"
  variant="flat"
  className=""
>
            Exportar CSV
          </Button>
          {csvData.length > 0 && (
          <Button onClick={() => setCsvData([])} color="danger" variant="flat">
            Limpar Arquivo
          </Button>
        )}
          </div>
          </div>

          <Table aria-label="Tabela de Dados CSV">
            <TableHeader>
              {Object.keys(csvData[0]).map((key) => (
                <TableColumn key={key}>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort(key)}>
                    {key} {sortColumn === key && (sortOrder === "asc" ? "↑" : "↓")}
                  </div>
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {currentRows.map((row, index) => {
                console.dir(row);
                return (
                <TableRow key={index}>
                  {Object.entries(row).map(([key, value], i) => (
                    <TableCell
                      key={i}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: key.includes("Desconto") ? "bold" : "normal",
                        color: key.includes("Desconto") ? "green" : "inherit",
                      }}
                    >
                      {key === "Link de acesso" ? (
                        <Button 
                        size="sm" 
                        color="secondary" 
                        variant="flat" 
                        as="a" 
                        href={String(value)}  
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Ver Imóvel
                      </Button>
                      ) : typeof value === "number" ? (
                        value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      ) : (
                        value
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )})}
            </TableBody>
          </Table>

          <div className="flex w-full justify-center mt-4">
            <Pagination
              isCompact
              showControls
              color="secondary"
              page={currentPage}
              total={totalPages}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>

          {/* Botão de Exportar
          <Button onClick={handleExport} color="secondary" variant="ghost" className="mt-4">
            Exportar CSV
          </Button> */}
        </div>
      )}
    </section>
  );
}
