import React from "react";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
// import { DirectoryUser } from "@";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  filteredUsers: any[];
  startIndex: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  filteredUsers,
  startIndex,
  setCurrentPage,
  setItemsPerPage,
}) => {
  return (
    <div className="flex-shrink-0 bg-white p-4" style={{ position: 'fixed', overflow: 'none' }}>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} Records
          </div>
          <div className="flex items-center gap-2">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setCurrentPage(1);
                setItemsPerPage(Number(e.target.value));
              }}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span className="text-sm text-gray-600 whitespace-nowrap">per page</span>
          </div>
        </div>
        <div className="flex items-center" style={{ marginLeft: '35rem' }}>
          <Pagination className="mx-0">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'} px-3 py-2 text-sm font-medium`}
                />
              </PaginationItem>
              {/* Dynamically generate page numbers */}
              {(() => {
                const maxVisiblePages = 2;
                const totalPagesArray = [...Array(totalPages).keys()].map(i => i + 1);
                let startPage = Math.max(1, currentPage - 1);
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                // Adjust if near the end
                if (endPage - startPage < maxVisiblePages - 1 && endPage < totalPages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                return totalPagesArray.slice(startPage - 1, endPage).map(pageNum => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className={`cursor-pointer px-3 py-2 text-sm font-medium min-w-[40px] ${currentPage === pageNum
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'hover:bg-gray-100'
                        }`}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ));
              })()}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'} px-3 py-2 text-sm font-medium`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default CustomPagination;