import { useState, useMemo } from 'react';

/**
 * Hook pour gérer la pagination côté client
 * @param {Array} data - Les données à paginer
 * @param {number} itemsPerPage - Nombre d'éléments par page (défaut: 10)
 */
export const usePagination = (data = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        items: [],
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage,
        startIndex: 0,
        endIndex: 0
      };
    }

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const validPage = Math.min(Math.max(currentPage, 1), totalPages);
    
    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = data.slice(startIndex, endIndex);

    return {
      items,
      currentPage: validPage,
      totalPages,
      totalItems: data.length,
      itemsPerPage,
      startIndex,
      endIndex,
      hasNextPage: validPage < totalPages,
      hasPreviousPage: validPage > 1
    };
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= paginationData.totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const nextPage = () => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (paginationData.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const reset = () => setCurrentPage(1);

  return {
    ...paginationData,
    goToPage,
    nextPage,
    prevPage,
    reset,
    setCurrentPage
  };
};

export default usePagination;
