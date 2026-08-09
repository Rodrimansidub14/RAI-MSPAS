const BOXES = Array.from({length: 8}, (_, index) => index);

export function DirectoryLoader() {
  return (
    <div aria-busy="true" aria-live="polite" className="directory-loader" role="status">
      <div aria-hidden="true" className="loader">
        {BOXES.map((box) => (
          <div className={"box box" + box} key={box}><div /></div>
        ))}
        <div className="ground"><div /></div>
      </div>
      <div className="loader-copy">
        <strong>Preparando el directorio</strong>
        <span>Buscando médicos y especialidades disponibles…</span>
      </div>
    </div>
  );
}
