import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Typography,
  Input,
  Spinner,
  List,
  ListItem,
  ListItemPrefix,
  Checkbox,
  IconButton,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ChevronUpDownIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/solid";

import { listingData } from "@/data/listingJSON";
// import api from "@/api/api.jsx"; // your axios instance; used only when SERVER_PAGINATION = true
// import * as XLSX from "xlsx/dist/xlsx.full.min.js";

// ----------------- CONFIG -----------------
const SERVER_PAGINATION = false; // set true to fetch pages from backend
const SERVER_ENDPOINT = "/api/listings"; // expected query params: page, limit, search, filters...
// ------------------------------------------

const defaultColumns = [
  { key: "name", label: "Name", width: 220 },
  { key: "address", label: "Address", width: 320 },
  { key: "website", label: "Website", width: 180 },
  { key: "phone_number", label: "Contact", width: 140 },
  { key: "reviews_count", label: "Review Count", width: 120 },
  { key: "reviews_average", label: "Review Avg", width: 120 },
  { key: "category", label: "Category", width: 140 },
  { key: "subcategory", label: "Sub-Category", width: 140 },
  { key: "city", label: "City", width: 140 },
  { key: "state", label: "State", width: 140 },
  { key: "area", label: "Area", width: 140 },
];

const convertToCSV = (arr) => {
  if (!arr || !arr.length) return "";
  const headers = Object.keys(arr[0]);
  const rows = arr.map((r) =>
    headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, "'")}"`).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
};

const ListingComplete = () => {
  // dark mode
  const [dark, setDark] = useState(false);

  // data states
  const [loading, setLoading] = useState(true);
  const [fullData, setFullData] = useState([]);
  const [pageData, setPageData] = useState([]); // current rendered page
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  // controls
  const [search, setSearch] = useState("");
  const [areaSearch, setAreaSearch] = useState("");
  const [cityFilters, setCityFilters] = useState([]); // multi-select
  const [stateFilters, setStateFilters] = useState([]); // multi-select
  const [categoryFilters, setCategoryFilters] = useState([]); // multi-select

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc

  const [columns, setColumns] = useState(defaultColumns);
  // resizing refs
  const resizerRef = useRef(null);
  const colRefs = useRef({});

  // expandable rows
  const [expandedIndex, setExpandedIndex] = useState(null);

  // server-side toggle (also exposes loading state)
  const serverPagination = SERVER_PAGINATION;

  // ---------------- Fetch data (client or server) ----------------
  useEffect(() => {
    let cancelled = false;

    const fetchClient = async () => {
      setLoading(true);
      // simulate small delay
      setTimeout(() => {
        if (!cancelled) {
          setFullData(listingData);
          setTotal(listingData.length);
          setLoading(false);
        }
      }, 350);
    };

    const fetchServer = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit,
          search,
        };
        // add filters and sorting
        if (cityFilters.length) params.cities = cityFilters.join(",");
        if (stateFilters.length) params.states = stateFilters.join(",");
        if (categoryFilters.length) params.categories = categoryFilters.join(",");
        if (sortField) {
          params.sortField = sortField;
          params.sortOrder = sortOrder;
        }
        const res = await api.get(SERVER_ENDPOINT, { params });
        // Expected response shape: { data: [...], total: 123 }
        setPageData(res.data.data);
        setTotal(res.data.total);
      } catch (err) {
        console.error("Server pagination fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    if (serverPagination) {
      fetchServer();
    } else {
      fetchClient();
    }

    return () => {
      cancelled = true;
    };
  }, [serverPagination, currentPage]); // server fetch depends on page; client fetch just populates fullData once

  // If client pagination: compute filtered -> sorted -> paginated
  const filtered = useMemo(() => {
    if (serverPagination) return fullData; // in server mode fullData might be empty
    let out = fullData ?? [];
    if (search) {
      const s = search.toLowerCase();
      out = out.filter((x) => (x.name || "").toLowerCase().includes(s));
    }
    if (areaSearch) {
      const s = areaSearch.toLowerCase();
      out = out.filter((x) => (x.area || "").toLowerCase().includes(s));
    }
    if (cityFilters.length) out = out.filter((x) => cityFilters.includes(x.city));
    if (stateFilters.length) out = out.filter((x) => stateFilters.includes(x.state));
    if (categoryFilters.length) out = out.filter((x) => categoryFilters.includes(x.category));
    return out;
  }, [fullData, search, areaSearch, cityFilters, stateFilters, categoryFilters, serverPagination]);

  const sorted = useMemo(() => {
    if (serverPagination) return filtered;
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const A = String(a[sortField] ?? "").toLowerCase();
      const B = String(b[sortField] ?? "").toLowerCase();
      if (A === B) return 0;
      return sortOrder === "asc" ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
    });
  }, [filtered, sortField, sortOrder, serverPagination]);

  // pagination for client-side
  useEffect(() => {
    if (serverPagination) return;
    setTotal(sorted.length);
    const start = (currentPage - 1) * limit;
    setPageData(sorted.slice(start, start + limit));
    setLoading(false);
  }, [sorted, currentPage, serverPagination]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ---------------- Sorting handler ----------------
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ---------------- CSV / Excel download ----------------
  const downloadCSV = (currentOnly = false) => {
    const arr = currentOnly ? pageData : (serverPagination ? pageData : fullData);
    const csv = convertToCSV(arr || []);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentOnly ? "listing_page.csv" : "listing_all.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (currentOnly = false) => {
    const arr = currentOnly ? pageData : (serverPagination ? pageData : fullData);
    if (!arr || !arr.length) return;
    const ws = XLSX.utils.json_to_sheet(arr);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Listings");
    XLSX.writeFile(wb, currentOnly ? "listing_page.xlsx" : "listing_all.xlsx");
  };

  // ---------------- Column resizing ----------------
  const startResize = (colKey, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const col = columns.find((c) => c.key === colKey);
    const startWidth = col.width;
    const onMouseMove = (ev) => {
      const delta = ev.clientX - startX;
      const newWidth = Math.max(80, startWidth + delta);
      setColumns((cols) => cols.map((c) => (c.key === colKey ? { ...c, width: newWidth } : c)));
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // ---------------- Multi-select handlers ----------------
  const toggleFilterValue = (value, setFn, arr) => {
    if (arr.includes(value)) {
      setFn(arr.filter((a) => a !== value));
    } else {
      setFn([...arr, value]);
    }
  };

  // ---------------- Derived filter option lists ----------------
  const allCities = useMemo(() => [...new Set(fullData.map((x) => x.city).filter(Boolean))], [fullData]);
  const allStates = useMemo(() => [...new Set(fullData.map((x) => x.state).filter(Boolean))], [fullData]);
  const allCategories = useMemo(() => [...new Set(fullData.map((x) => x.category).filter(Boolean))], [fullData]);

  // ---------------- Expand row ----------------
  const toggleExpand = (idx) => setExpandedIndex((p) => (p === idx ? null : idx));

  // ---------------- Dark mode effect on body ----------------
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  // ---------------- Render ----------------
  return (
    <div className={`mt-8 mb-12 px-4 rounded ${dark ? "bg-gray-900 text-gray-100" : "bg-white text-black"} min-h-screen`}>
      <div className="flex items-center justify-between mb-4 ">
        <Typography variant="h4" className="m-2">Listing Table</Typography>

        <div className="flex items-center gap-2 m-2">
          <IconButton variant="text" onClick={() => setDark((d) => !d)} title="Toggle dark">
            {dark ? <SunIcon className="h-5 w-5 text-yellow-300" /> : <MoonIcon className="h-5 w-5" />}
          </IconButton>

          <Button size="sm" onClick={() => downloadCSV(false)} className="flex items-center gap-1">
            <ArrowDownTrayIcon className="h-4 w-4" /> CSV All
          </Button>

          <Button size="sm" onClick={() => downloadCSV(true)} className="flex items-center gap-1">
            <ArrowDownTrayIcon className="h-4 w-4" /> CSV Page
          </Button>

          <Button size="sm" onClick={() => downloadExcel(false)} className="flex items-center gap-1">
            Excel All
          </Button>

          <Button size="sm" onClick={() => downloadExcel(true)} className="flex items-center gap-1">
            Excel Page
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader color="gray" variant="gradient" className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex gap-3 items-center flex-wrap">
            <Input label="Search name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Input label="Search area..." value={areaSearch} onChange={(e) => setAreaSearch(e.target.value)} icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
            
          </div>

          <div className="flex gap-2 items-center">
            <div className="text-sm">Page {currentPage} / {totalPages}</div>
            <Button size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
            <Button size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </CardHeader>

        

        

        {/* TABLE */}
        <CardBody className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 flex justify-center">
              <Spinner className="h-10 w-10" />
            </div>
          ) : (
            <div style={{ minWidth: columns.reduce((s, c) => s + (c.width || 140), 0) }}>
              <table className={`w-full table-fixed border-collapse ${dark ? "text-gray-100" : ""}`}>
                <thead className={`sticky top-0 z-20 ${dark ? "bg-gray-800" : "bg-gray-100"} border-b`}>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} style={{ width: col.width }} className="text-left relative px-3 py-2 select-none">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleSort(col.key)}>
                            <span className="capitalize text-sm font-semibold">{col.label}</span>
                            {sortField === col.key ? (sortOrder === "asc" ? <ChevronUpDownIcon className="h-4" /> : <ChevronDownIcon className="h-4" />) : <ChevronUpDownIcon className="h-4 opacity-40" />}
                          </div>

                          {/* resizer handle */}
                          <div
                            onMouseDown={(e) => startResize(col.key, e)}
                            className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                            style={{ touchAction: "none" }}
                            title="Drag to resize"
                          >
                            <div className="h-full w-px bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600" />
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pageData.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} className="p-6 text-center text-sm text-gray-500">
                        No records found
                      </td>
                    </tr>
                  )}

                  {pageData.map((row, idx) => {
                    const globalIdx = (currentPage - 1) * limit + idx;
                    const expanded = expandedIndex === globalIdx;
                    return (
                      <React.Fragment key={idx}>
                        <tr className='border-b border-blue-gray-50 py-3 px-5 text-left'>
                          {columns.map((col) => (
                            <td key={col.key} style={{ width: col.width, maxWidth: col.width }} className="px-3 py-3 align-top text-sm break-words">
                              {String(row[col.key] ?? "-")}
                            </td>
                          ))}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* pagination footer */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <Button size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</Button>
        <Button size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>

        <div className="px-3 py-1 border rounded">
          Page {currentPage} / {totalPages}
        </div>

        <Button size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
        <Button size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</Button>
      </div>
    </div>
  );
};

export default ListingComplete;
