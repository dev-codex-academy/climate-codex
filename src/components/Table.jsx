import React, { useMemo, useState } from "react";
import { FileInput, MoreHorizontal, OctagonX, RefreshCcw, RotateCcwKey, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Table = ({
  data = [],
  columns = [],
  onEdit,
  onToggle,
  onAskDelete,
  onResetPassword,
  onViewContact,
  verSeguimiento,
  searchable = true,
  pageSizeOptions = [10, 20, 50],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] || 10);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const baseCols = useMemo(() => columns.filter((c) => !c.hidden), [columns]);
  const visibleCols = useMemo(
    () => [...baseCols, { key: "_actions", label: "", width: 80 }],
    [baseCols]
  );

  const isDateKey = (k) => typeof k === "string" && k.startsWith("fecha");
  const fmtDate = (v) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? String(v ?? "") : d.toLocaleDateString();
  };

  const renderCell = (col, row) => {
    if (col.key === "_actions") {
      return (
        <RowActions
          row={row}
          onEdit={onEdit}
          onToggle={onToggle}
          onAskDelete={onAskDelete}
          onResetPassword={onResetPassword}
          onViewContact={onViewContact}
          verSeguimiento={verSeguimiento}
        />
      );
    }

    const val = row[col.key];

    if (col.key === "activo") {
      const activo =
        typeof val === "boolean"
          ? val
          : String(val ?? "").toLowerCase() === "si" ||
          String(val ?? "") === "1";

      return <span>{activo ? "Active" : "Inactive"}</span>;
    }

    if (isDateKey(col.key)) {
      return String(val ?? "");
    }

    if (col.key === "valores_pre_cargados") {
      const lista = val?.valores;

      if (!lista || !Array.isArray(lista) || lista.length === 0) {
        return (
          <span className="text-muted-foreground text-xs">Not selector</span>
        );
      }

      return (
        <div className="flex gap-1 flex-wrap justify-center w-full max-w-60">
          {lista.map((item, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-codex-fondo-primary-variante1 dark:bg-codex-fondo-primary-variante4 text-codex-cards-primary dark:text-codex-texto-primary-variante1 rounded-full text-xs border border-primary/20"
            >
              {item}
            </span>
          ))}
        </div>
      );
    }

    if (col.key === "color" && typeof val === "string") {
      return (
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
            style={{ backgroundColor: val }}
          ></div>
          <span className="text-xs text-gray-500">{val}</span>
        </div>
      );
    }

    return String(val ?? "");
  };



  const filtered = useMemo(() => {
    if (!searchTerm) return data;
    const q = searchTerm.toLowerCase();
    return data.filter((row) =>
      baseCols.some((col) => {
        const raw = row[col.key];
        const str = String(raw ?? "");
        return str.toLowerCase().includes(q);
      })
    );
  }, [data, searchTerm, baseCols]);

  const getSortValue = (row, key) => {
    const v = row[key];
    if (v == null) return null;
    if (isDateKey(key)) {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d.getTime();
    }
    if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v !== "number" && !isNaN(Number(v))) return Number(v);
    return v;
  };

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      if (va == null && vb != null) return sortDir === "asc" ? -1 : 1;
      if (va != null && vb == null) return sortDir === "asc" ? 1 : -1;
      if (va == null && vb == null) return 0;

      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }

      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalRecords = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const startRecord = totalRecords ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = totalRecords
    ? Math.min(currentPage * pageSize, totalRecords)
    : 0;

  const toggleSort = (key) => {
    if (key === "_actions") return;
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-auto">
          {searchable && (
            <div className="relative w-full">
              {/* Input de shadcn */}
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full sm:w-[320px] pr-9 text-codex-texto-primary dark:text-codex-texto-primary-variante1"
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-codex-iconos-primary dark:text-codex-iconos-primary-variante1 hover:text-foreground/80 cursor-pointer"
                  title="Clear"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Select de shadcn */}
        <div className="flex items-center gap-2 sm:justify-end">
          <span className="text-sm text-codex-texto-primary dark:text-codex-texto-primary-variante1">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[88px] h-11">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent align="end" sideOffset={4}>
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto mt-4 rounded-sm border border-codex-bordes-secondary-variante2 dark:border-codex-bordes-primary-variante4 bg-transparent relative">
        <div className="min-w-full inline-block align-middle">
          <table className="w-full text-sm">
            <thead className="bg-codex-fondo-primary-variante2 dark:bg-codex-fondo-primary-variante3 text-center text-codex-texto-secondary dark:text-codex-texto-primary-variante1">
              <tr>
                {visibleCols.map((col) => {
                  const canSort = col.key !== "_actions";
                  const isSorted = sortKey === col.key ? sortDir : null;
                  return (
                    <th
                      key={col.key}
                      style={col.width ? { width: col.width } : undefined}
                      className={[
                        "px-2 py-4 text-xs font-semibold tracking-wide text-center sticky top-0 z-10 bg-codex-fondo-primary-variante2 dark:bg-codex-fondo-primary-variante3",
                        canSort ? "cursor-pointer select-none" : "",
                      ].join(" ")}
                      onClick={canSort ? () => toggleSort(col.key) : undefined}
                      title={canSort ? "Click to sort" : undefined}
                    >
                      <div className="flex items-center gap-1 justify-center">
                        {col.label}
                        {isSorted === "asc" && <span>▲</span>}
                        {isSorted === "desc" && <span>▼</span>}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-codex-texto-secondary dark:text-codex-texto-primary-variante1">
              {currentData.length ? (
                currentData.map((row, idx) => (
                  <tr
                    key={row.id_rol ?? row.id ?? idx}
                    className="hover:bg-codex-hover-primary-variante1 dark:hover:bg-codex-hover-primary-variante4/70"
                  >
                    {visibleCols.map((col) => (
                      <td
                        key={col.key}
                        className={[
                          "px-4 py-3",
                          col.key === "_actions" ? "text-center" : "",
                          isDateKey(col.key) ? "text-center" : "",
                          col.key === "activo" ? "text-center" : "",
                          col.key === "valores_pre_cargados" ? "text-center" : "",
                        ].join(" ")}
                      >
                        {renderCell(col, row)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={visibleCols.length}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="mt-auto px-4 py-3 text-xs border-t border-border">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className=" text-center sm:text-left">
            <span className="font-medium text-foreground">{startRecord}</span> -{" "}
            <span className="font-medium text-foreground">{endRecord}</span>{" "}
            (Page {currentPage} of {totalPages})
          </div>
          <div className="flex items-center justify-center gap-1 text-codex-secondary">
            <Button
              variant="terciary"
              className="h-9 px-3"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              const isActive = page === currentPage;
              return (
                <Button
                  key={page}
                  variant={isActive ? "terciary" : "paginacionNoActive"}
                  className={isActive ? "text-codex-cards-secondary-variante1 h-9 px-3" : "h-9 px-3"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="terciary"
              className="h-9 px-3"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RowActions = ({
  row,
  onEdit,
  onToggle,
  onAskDelete,
  onResetPassword,
  onViewContact,
  verSeguimiento
}) => {
  const activo =
    typeof row.activo === "boolean"
      ? row.activo
      : String(row.activo ?? "").toLowerCase() === "si" ||
      String(row.activo ?? "") === "1";

  const hasReset = typeof onResetPassword === "function";
  const hasContacto = typeof onViewContact === "function";
  const hasSeguimiento = typeof verSeguimiento === "function";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="terciary" size="icon" className="h-8 w-8 rounded-md">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-48">
        <DropdownMenuItem onClick={() => onEdit?.(row)}>
          <SquarePen className="w-6 h-6 text-codex-iconos-primary dark:text-codex-iconos-primary-variante1" />
          Edit
        </DropdownMenuItem>

        {hasContacto && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewContact(row)}>
              View contacts
            </DropdownMenuItem>
          </>
        )}

        {hasReset && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onResetPassword(row)}>
              <RotateCcwKey className="w-6 h-6 text-codex-iconos-terciario dark:text-codex-iconos-primary-variante2" />
              Reset Password
            </DropdownMenuItem>
          </>
        )}

        {hasSeguimiento && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => verSeguimiento(row)}>
              <FileInput className="w-6 h-6 text-codex-iconos-terciario dark:text-codex-iconos-primary-variante2" />
              View Tracking
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:text-destructive focus:text-destructive"
          onClick={() => onAskDelete?.(row)}
        >
          <OctagonX className="w-6 h-6 text-destructive focus:text-destructive" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
