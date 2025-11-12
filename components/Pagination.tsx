import React from "react";

interface Props {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const Pagination: React.FC<Props> = ({ page, totalPages, onPrev, onNext }) => (
  <div className="flex justify-between mt-4">
    <button
      className="bg-gray-300 px-4 py-2 rounded"
      onClick={onPrev}
      disabled={page === 1}
    >
      Previous
    </button>
    <span>
      Page {page} of {totalPages}
    </span>
    <button
      className="bg-gray-300 px-4 py-2 rounded"
      onClick={onNext}
      disabled={page === totalPages}
    >
      Next
    </button>
  </div>
);

export default Pagination;
