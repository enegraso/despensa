const StockBadge = ({ stockActual, stockMinimo }) => {
  if (stockActual <= 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Sin stock
      </span>
    );
  }
  if (stockActual <= stockMinimo) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        Stock bajo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      OK
    </span>
  );
};

export default StockBadge;
