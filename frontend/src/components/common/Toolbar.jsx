import { Search } from "lucide-react";

export default function Toolbar({ query, setQuery, placeholder, filters, right }) {
  return (
    <div className="toolbar">
      <div className="search-input">
        <Search size={14} color="#8A93A6" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} />
      </div>
      {filters}
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}
