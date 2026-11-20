export const formatFriendlyDate = (dateStr: string | null | undefined, timeZone?: 'UTC'): string => {
  if (!dateStr) return 'Presente';

  try {
    // Check if it's YYYY-MM
    let dateObj: Date;
    if (dateStr.length === 7 && dateStr.includes('-')) {
      const [year, month] = dateStr.split('-');
      dateObj = timeZone
        ? new Date(Date.UTC(Number(year), Number(month) - 1, 1))
        : new Date(Number(year), Number(month) - 1, 1);
    } else {
      dateObj = new Date(dateStr);
    }

    if (isNaN(dateObj.getTime())) {
      return dateStr;
    }

    const formatter = new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      year: 'numeric',
      timeZone,
    });

    const formatted = formatter.format(dateObj);
    // Capitalize first letter (e.g. "ene 2023" => "Ene 2023")
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    
  } catch {
    return dateStr; // fallback to original if parsing fails
  }
};
