import {useEffect} from "react";
import {Clock3, ExternalLink, MapPin, Phone, X} from "lucide-react";
import type {Doctor} from "../api";
import {businessStatus, getInitials, toTitleCase} from "../utils/doctor";

interface DoctorModalProps {
  doctor: Doctor;
  onClose: () => void;
}

export function DoctorModal({doctor, onClose}: DoctorModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-label={"Información de " + doctor.nombre}
        aria-modal="true"
        className="doctor-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="Cerrar"
          className="icon-button close-button"
          onClick={onClose}
          type="button"
        >
          <X size={20} />
        </button>
        <div className="modal-header">
          <div className="doctor-avatar large">{getInitials(doctor.nombre)}</div>
          <div>
            <span className="specialty-pill">{toTitleCase(doctor.especialidad)}</span>
            <h2>{doctor.nombre}</h2>
            <p className="status"><span /> {businessStatus(doctor.estado_negocio)}</p>
          </div>
        </div>

        <div className="detail-list">
          {doctor.direccion ? <p><MapPin size={17} />{doctor.direccion}</p> : null}
          {doctor.datos_contacto?.telefono_mostrado || doctor.telefono ? (
            <p><Phone size={17} />{doctor.datos_contacto?.telefono_mostrado || doctor.telefono}</p>
          ) : null}
          {doctor.horarios?.descripcion_semanal?.length ? (
            <div className="hours">
              <Clock3 size={17} />
              <div>{doctor.horarios.descripcion_semanal.map((hour) => <p key={hour}>{hour}</p>)}</div>
            </div>
          ) : <p><Clock3 size={17} />Horarios no disponibles</p>}
        </div>

        <div className="modal-actions">
          {doctor.google_maps_url ? (
            <a className="secondary-action" href={doctor.google_maps_url} rel="noreferrer" target="_blank">
              <MapPin size={17} /> Ver en Maps
            </a>
          ) : null}
          {doctor.sitio_web ? (
            <a className="primary-action" href={doctor.sitio_web} rel="noreferrer" target="_blank">
              <ExternalLink size={17} /> Sitio web
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}
