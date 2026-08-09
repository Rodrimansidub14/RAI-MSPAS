import {useEffect, useState} from "react";

const SPECIALTY_PARAM = "especialidad";

const readSpecialtyFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get(SPECIALTY_PARAM);
};

export function useSpecialtyRoute() {
  const [routeSpecialty, setRouteSpecialty] = useState<string | null>(readSpecialtyFromUrl);

  useEffect(() => {
    const syncRoute = () => setRouteSpecialty(readSpecialtyFromUrl());
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const navigateToSpecialty = (specialty: string | null) => {
    const url = new URL(window.location.href);

    if (specialty) {
      url.searchParams.set(SPECIALTY_PARAM, specialty);
    } else {
      url.searchParams.delete(SPECIALTY_PARAM);
    }

    window.history.pushState({}, "", url);
    setRouteSpecialty(specialty);
  };

  return {navigateToSpecialty, routeSpecialty};
}
