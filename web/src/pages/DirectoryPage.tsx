import {useEffect, useMemo, useState} from "react";
import {
  ArrowLeft,
  Building2,
  HeartPulse,
  LayoutGrid,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import {getDoctors, type Doctor} from "../api";
import {DirectoryLoader} from "../components/DirectoryLoader";
import {DirectoryToolbar} from "../components/DirectoryToolbar";
import {DoctorCard} from "../components/DoctorCard";
import {DoctorModal} from "../components/DoctorModal";
import {Pagination} from "../components/Pagination";
import {SpecialtyCards} from "../components/SpecialtyCards";
import {useSpecialtyRoute} from "../hooks/useSpecialtyRoute";
import {toTitleCase} from "../utils/doctor";

const DOCTORS_PER_PAGE = 8;
const ALL_SPECIALTIES = "Todas";

export function DirectoryPage() {
  const {navigateToSpecialty, routeSpecialty} = useSpecialtyRoute();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState(routeSpecialty || ALL_SPECIALTIES);
  const [zone, setZone] = useState("Todas");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDirectory = async () => {
    setCurrentPage(1);
    setLoading(true);
    setError("");

    try {
      setDoctors(await getDoctors());
    } catch (requestError) {
      setError(requestError instanceof Error ?
        requestError.message :
        "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDirectory();
  }, []);

  useEffect(() => {
    setSpecialty(routeSpecialty || ALL_SPECIALTIES);
    setCurrentPage(1);
  }, [routeSpecialty]);

  const specialties = useMemo(() => Array.from(new Set(
    doctors.map((doctor) => toTitleCase(doctor.especialidad))
  )).sort(), [doctors]);
  const zones = useMemo(() => {
    const doctorsForSpecialty = specialty === ALL_SPECIALTIES ?
      doctors :
      doctors.filter((doctor) => toTitleCase(doctor.especialidad) === specialty);

    return Array.from(new Set(doctorsForSpecialty.map((doctor) => doctor.zona)
      .filter((item): item is string => Boolean(item)))).sort();
  }, [doctors, specialty]);

  useEffect(() => {
    if (zone !== "Todas" && !zones.includes(zone)) {
      setZone("Todas");
      setCurrentPage(1);
    }
  }, [zone, zones]);
  const specialtySummaries = useMemo(() => specialties.map((name) => ({
    name,
    total: doctors.filter((doctor) => toTitleCase(doctor.especialidad) === name).length,
  })), [doctors, specialties]);

  const visibleDoctors = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es-GT");

    return doctors.filter((doctor) => {
      const matchesSpecialty = specialty === ALL_SPECIALTIES ||
        toTitleCase(doctor.especialidad) === specialty;
      const matchesZone = zone === "Todas" || doctor.zona === zone;
      const searchable = (doctor.nombre + " " + (doctor.direccion || "") + " " +
        (doctor.especialidad || "")).toLocaleLowerCase("es-GT");

      return matchesSpecialty && matchesZone &&
        (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [doctors, search, specialty, zone]);

  const totalPages = Math.max(1, Math.ceil(visibleDoctors.length / DOCTORS_PER_PAGE));
  const firstDoctorIndex = visibleDoctors.length ?
    (currentPage - 1) * DOCTORS_PER_PAGE + 1 : 0;
  const lastDoctorIndex = Math.min(currentPage * DOCTORS_PER_PAGE, visibleDoctors.length);
  const pageDoctors = visibleDoctors.slice(firstDoctorIndex - 1, lastDoctorIndex);
  const isSpecialtyPage = Boolean(routeSpecialty);

  const chooseSpecialty = (nextSpecialty: string) => {
    navigateToSpecialty(nextSpecialty === ALL_SPECIALTIES ? null : nextSpecialty);
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const updateZone = (value: string) => {
    setZone(value);
    setCurrentPage(1);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <HeartPulse fill="currentColor" size={25} />
          <span>MedDirectorio</span>
        </div>
        <div className="sidebar-copy">
          <span className="eyebrow">Ministerio de Educación</span>
          <h1>Encuentra atención especializada</h1>
          <p>Directorio de profesionales y centros médicos de Ciudad de Guatemala.</p>
        </div>
        <div className="info-card">
          <ShieldCheck size={25} />
          <div>
            <strong>Información verificada</strong>
            <p>Datos obtenidos de Google Places y consultados desde nuestro directorio.</p>
          </div>
        </div>
        <div className="sidebar-footer"><Building2 size={17} /> Ciudad de Guatemala</div>
      </aside>

      <section className="directory">
        <header className="topbar">
          <div>
            <span className="eyebrow">Directorio médico</span>
            <h1>{isSpecialtyPage ? "Especialistas en " + specialty : "Médicos especialistas"}</h1>
          </div>
          <span className="header-badge">Datos verificados</span>
        </header>

        {isSpecialtyPage ? (
          <button className="back-button" onClick={() => chooseSpecialty(ALL_SPECIALTIES)} type="button">
            <ArrowLeft size={17} /> Ver todas las especialidades
          </button>
        ) : (
          <SpecialtyCards
            activeSpecialty={routeSpecialty || undefined}
            onSelect={chooseSpecialty}
            specialties={specialtySummaries}
          />
        )}

        <section aria-labelledby="doctors-heading" className="directory-list-section">
          <div className="list-heading">
            <div>
              <span className="eyebrow">Directorio completo</span>
              <h2 id="doctors-heading">{isSpecialtyPage ? specialty : "Todos los médicos"}</h2>
            </div>
            <button className="all-doctors-button" onClick={() => chooseSpecialty(ALL_SPECIALTIES)} type="button">
              <LayoutGrid size={16} /> Todos
            </button>
          </div>

          <DirectoryToolbar
            onSearchChange={updateSearch}
            onSpecialtyChange={chooseSpecialty}
            onZoneChange={updateZone}
            search={search}
            specialties={specialties}
            specialty={specialty}
            zones={zones}
            zone={zone}
          />

          <div className="results-heading">
            <p>{loading ? "Cargando directorio…" : visibleDoctors.length + " resultado" +
              (visibleDoctors.length === 1 ? "" : "s")}</p>
            <button className="refresh-button" disabled={loading} onClick={() => void loadDirectory()} type="button">
              Actualizar
            </button>
          </div>

          {error ? (
            <div className="state-card error">
              <h3>No fue posible mostrar el directorio</h3>
              <p>{error}</p>
              <button onClick={() => void loadDirectory()} type="button">Reintentar</button>
            </div>
          ) : null}
          {!error && loading ? <DirectoryLoader /> : null}
          {!error && !loading && visibleDoctors.length === 0 ? (
            <div className="state-card">
              <Stethoscope size={34} />
              <h3>No encontramos resultados</h3>
              <p>Prueba con otra búsqueda o cambia los filtros.</p>
            </div>
          ) : null}
          {!error && !loading && visibleDoctors.length > 0 ? (
            <div className="card-grid">
              {pageDoctors.map((doctor) => (
                <DoctorCard doctor={doctor} key={doctor.id} onSelect={setSelectedDoctor} />
              ))}
            </div>
          ) : null}
          {!error && !loading && visibleDoctors.length > 0 ? (
            <Pagination
              currentPage={currentPage}
              firstItem={firstDoctorIndex}
              lastItem={lastDoctorIndex}
              onPageChange={setCurrentPage}
              totalDirectoryItems={doctors.length}
              totalItems={visibleDoctors.length}
              totalPages={totalPages}
            />
          ) : null}
        </section>
      </section>

      {selectedDoctor ? <DoctorModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} /> : null}
    </main>
  );
}
