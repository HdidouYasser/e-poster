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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Search Bar */}
      {onSearch && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher..."
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {localSearch && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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
          <div className="p-8 text-center text-gray-500">
            Aucune donnée disponible
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-3 text-left font-semibold text-gray-700 ${
                      col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
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
                {actions && <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={row[rowKey] || idx}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4">
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
