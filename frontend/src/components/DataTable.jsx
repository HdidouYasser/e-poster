import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, X } from 'lucide-react';
import Pagination from './Pagination';
import { LoadingState } from './LoadingState';

/**
 * Composant DataTable réutilisable pour afficher les données avec tri et filtre
 */
export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange = () => {},
  onSearch = () => {},
  onSort = () => {},
  sortBy = null,
  sortOrder = 'asc',
  searchQuery = '',
  onSearchChange = () => {},
  actions = null,
  rowKey = 'id'
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearch = (value) => {
    setLocalSearch(value);
    onSearchChange(value);
  };

  const handleSort = (columnKey) => {
    const newOrder = sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newOrder);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <div className="table-wrapper">
      {/* Search Bar */}
      {onSearch && (
        <div className="p-4 border-b border-zinc-200/60">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Rechercher..."
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="form-input pl-10 pr-10"
            />
            {localSearch && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8">
            <LoadingState type="table" count={5} />
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            Aucune donnée disponible
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr className="table-head">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`${
                      col.sortable ? 'cursor-pointer hover:bg-zinc-100' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && sortBy === col.key && (
                        sortOrder === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody className="table-body">
              {data.map((row, idx) => (
                <tr
                  key={row[rowKey] || idx}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div className="flex gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          itemsPerPage={data.length}
          totalItems={null}
          showInfo={true}
        />
      )}
    </div>
  );
};

export default DataTable;
