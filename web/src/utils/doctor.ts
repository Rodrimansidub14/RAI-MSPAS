export const toTitleCase = (value?: string): string => {
  if (!value) return "Sin especialidad";
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const getInitials = (name: string): string => {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((word) => word[0]);
  return initials.join("").toUpperCase() || "MD";
};

export const businessStatus = (status?: string): string => {
  if (status === "OPERATIONAL") return "En operación";
  if (status === "CLOSED_TEMPORARILY") return "Cerrado temporalmente";
  if (status === "CLOSED_PERMANENTLY") return "Cerrado permanentemente";
  return "Estado no disponible";
};
