import {Search} from "lucide-react";
import {FilterSelect} from "./FilterSelect";

interface DirectoryToolbarProps {
  onSearchChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onZoneChange: (value: string) => void;
  search: string;
  specialties: string[];
  specialty: string;
  zones: string[];
  zone: string;
}

export function DirectoryToolbar({
  onSearchChange,
  onSpecialtyChange,
  onZoneChange,
  search,
  specialties,
  specialty,
  zones,
  zone,
}: DirectoryToolbarProps) {
  return (
    <div className="toolbar">
      <label className="searchbox">
        <Search size={20} />
        <input
          aria-label="Buscar médico, dirección o especialidad"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder=" "
          value={search}
        />
        <span className="search-label">Buscar por nombre, especialidad o dirección</span>
      </label>
      <FilterSelect
        label="Especialidad"
        onChange={onSpecialtyChange}
        options={specialties}
        totalLabel={"Todas (" + specialties.length + ")"}
        value={specialty}
      />
      <FilterSelect
        label="Zona"
        onChange={onZoneChange}
        options={zones}
        totalLabel={"Todas (" + zones.length + ")"}
        value={zone}
      />
    </div>
  );
}
