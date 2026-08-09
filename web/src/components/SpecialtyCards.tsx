import {ArrowRight, Stethoscope} from "lucide-react";

interface SpecialtyCardsProps {
  activeSpecialty?: string;
  onSelect: (specialty: string) => void;
  specialties: Array<{name: string; total: number}>;
}

export function SpecialtyCards({activeSpecialty, onSelect, specialties}: SpecialtyCardsProps) {
  return (
    <section aria-labelledby="specialties-heading" className="specialty-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Explora por necesidad</span>
          <h2 id="specialties-heading">Elige una especialidad</h2>
        </div>
        <p>Accede rápidamente a los médicos registrados por área de atención.</p>
      </div>
      <div className="specialty-grid">
        {specialties.map((specialty) => (
          <button
            className={activeSpecialty === specialty.name ? "specialty-card is-active" : "specialty-card"}
            key={specialty.name}
            onClick={() => onSelect(specialty.name)}
            type="button"
          >
            <span className="specialty-icon"><Stethoscope size={20} /></span>
            <span className="specialty-card-copy">
              <strong>{specialty.name}</strong>
              <small>{specialty.total} médico{specialty.total === 1 ? "" : "s"}</small>
            </span>
            <ArrowRight className="specialty-arrow" size={18} />
          </button>
        ))}
      </div>
    </section>
  );
}
