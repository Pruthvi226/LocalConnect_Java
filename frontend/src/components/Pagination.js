import React from 'react';
import './Pagination.css';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalElements, 
  size 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(0, currentPage - 2);
      let end = Math.min(totalPages - 1, start + 4);
      
      if (end === totalPages - 1) {
        start = Math.max(0, end - 4);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {currentPage * size + 1} - {Math.min((currentPage + 1) * size, totalElements)} of {totalElements} results
      </div>
      <div className="pagination-controls">
        <button 
          className="pagination-btn" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <FiChevronLeft />
        </button>
        
        {getPageNumbers().map(page => (
          <button 
            key={page}
            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page + 1}
          </button>
        ))}

        <button 
          className="pagination-btn" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

