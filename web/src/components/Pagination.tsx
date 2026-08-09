import {FaChevronLeft, FaChevronRight} from "react-icons/fa6";

interface PaginationProps {
  currentPage: number;
  firstItem: number;
  lastItem: number;
  onPageChange: (page: number) => void;
  totalDirectoryItems: number;
  totalItems: number;
  totalPages: number;
}

export function Pagination({
  currentPage,
  firstItem,
  lastItem,
  onPageChange,
  totalDirectoryItems,
  totalItems,
  totalPages,
}: PaginationProps) {
  return (
    <nav aria-label="Paginación del directorio" className="pagination">
      <p>
        Mostrando <strong>{firstItem}–{lastItem}</strong> de <strong>{totalItems}</strong> médicos
        {totalItems !== totalDirectoryItems ? " (" + totalDirectoryItems + " en total)" : ""}
      </p>
      <div className="pagination-controls">
        <button
          aria-label="Página anterior"
          className="page-button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          <FaChevronLeft />
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button
          aria-label="Página siguiente"
          className="page-button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          <FaChevronRight />
        </button>
      </div>
    </nav>
  );
}
