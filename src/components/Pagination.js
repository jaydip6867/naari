import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const getPaginationNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          '...',
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          '...',
          currentPage,
          '...',
          totalPages
        );
      }
    }

    return pages;
  };

  const paginate = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginTop: '24px',
      flexWrap: 'wrap'
    }}>
      {/* First */}
      <button
        onClick={() => paginate(1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        &laquo;
      </button>

      {/* Prev */}
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        &lsaquo;
      </button>

      {/* Pages */}
      {getPaginationNumbers().map((page, index) =>
        page === '...' ? (
          <span key={index} style={{ fontSize: '20px', color: '#666' }}>
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => paginate(page)}
            className={`pagination-btn ${
              currentPage === page ? 'active' : ''
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        &rsaquo;
      </button>

      {/* Last */}
      <button
        onClick={() => paginate(totalPages)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;