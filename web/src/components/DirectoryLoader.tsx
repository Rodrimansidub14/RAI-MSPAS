export function DirectoryLoader() {
  return (
    <div aria-busy="true" aria-live="polite" className="directory-loader" role="status">
      <div aria-hidden="true" className="directory-spinner" />
      <span className="loader-text">Cargando directorio…</span>
    </div>
  );
}