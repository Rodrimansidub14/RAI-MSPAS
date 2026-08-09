import {MapPin, Phone} from "lucide-react";
import type {Doctor} from "../api";
import {businessStatus, getInitials, toTitleCase} from "../utils/doctor";

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (doctor: Doctor) => void;
}

export function DoctorCard({doctor, onSelect}: DoctorCardProps) {
  return (
    <article className="doctor-card">
      <div className="card-top">
        <div className="doctor-avatar">{getInitials(doctor.nombre)}</div>
        <span className="status-dot" title={businessStatus(doctor.estado_negocio)} />
      </div>
      <span className="specialty-pill">{toTitleCase(doctor.especialidad)}</span>
      <h3>{doctor.nombre}</h3>
      <p className="address">
        <MapPin size={16} />
        {doctor.direccion || "Dirección no disponible"}
      </p>
      <div className="card-actions">
        <button onClick={() => onSelect(doctor)} type="button">Ver perfil</button>
        {doctor.datos_contacto?.telefono_mostrado || doctor.telefono ? (
          <a aria-label={"Llamar a " + doctor.nombre} href={"tel:" + (doctor.telefono || "")}>
            <Phone size={18} />
          </a>
        ) : null}
      </div>
    </article>
  );
}
