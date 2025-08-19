import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate range around current page
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - halfVisible);
      let end = Math.min(totalPages, currentPage + halfVisible);

      // Adjust if we're near the beginning or end
      if (currentPage <= halfVisible) {
        end = maxVisiblePages;
      } else if (currentPage > totalPages - halfVisible) {
        start = totalPages - maxVisiblePages + 1;
      }

      // Add first page and ellipsis if needed
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('ellipsis');
        }
      }

      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('ellipsis');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const buttonClass = (isActive: boolean, isDisabled: boolean = false) => {
    const baseClass =
      'relative inline-flex items-center px-3 py-2 text-sm font-medium border transition-colors';

    if (isDisabled) {
      return `${baseClass} border-gray-600 text-gray-500 cursor-not-allowed`;
    }

    if (isActive) {
      return `${baseClass} border-blue-500 bg-blue-600 text-white`;
    }

    return `${baseClass} border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white`;
  };

  return (
    <nav className={`flex items-center justify-between ${className}`}>
      <div className="flex-1 flex justify-between sm:hidden">
        {/* Mobile pagination */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={buttonClass(false, currentPage === 1)}
        >
          Previous
        </button>
        <span className="text-sm text-gray-400 flex items-center">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={buttonClass(false, currentPage === totalPages)}
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-400">
            Page <span className="font-medium text-white">{currentPage}</span>{' '}
            of <span className="font-medium text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`${buttonClass(false, currentPage === 1)} rounded-l-md`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </button>

            {/* First page button (if not in visible range) */}
            {showFirstLast && visiblePages[0] !== 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className={buttonClass(currentPage === 1)}
                >
                  1
                </button>
                {visiblePages[0] !== 2 && (
                  <span className="relative inline-flex items-center px-3 py-2 border border-gray-600 bg-gray-700 text-gray-400 text-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                )}
              </>
            )}

            {/* Visible page buttons */}
            {visiblePages.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-600 bg-gray-700 text-gray-400 text-sm"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={buttonClass(currentPage === page)}
                >
                  {page}
                </button>
              );
            })}

            {/* Last page button (if not in visible range) */}
            {showFirstLast &&
              visiblePages[visiblePages.length - 1] !== totalPages && (
                <>
                  {visiblePages[visiblePages.length - 1] !== totalPages - 1 && (
                    <span className="relative inline-flex items-center px-3 py-2 border border-gray-600 bg-gray-700 text-gray-400 text-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </span>
                  )}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className={buttonClass(currentPage === totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`${buttonClass(false, currentPage === totalPages)} rounded-r-md`}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </button>
          </nav>
        </div>
      </div>
    </nav>
  );
};

export { Pagination };
