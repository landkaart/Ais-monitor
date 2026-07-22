import * as turf from "@turf/turf";
import seaAreas from "./metoffice_sea_areas.geojson";

/**
 * Geef het zeegebied terug waarin een positie ligt
 * @param {[number, number]} position [longitude, latitude]
 * @returns {object|null}
 */
export function getSeaArea(position) {
  const point = turf.point(position);

  const found = seaAreas.features.find(feature =>
    turf.booleanPointInPolygon(point, feature)
  );

  return found || null;
}


/**
 * Geef alleen de naam van het zeegebied terug
 * @param {[number, number]} position [longitude, latitude]
 * @returns {string|null}
 */
export function getSeaAreaName(position) {
  const area = getSeaArea(position);

  return area
    ? area.properties.name
    : null;
}


/**
 * Geef alle beschikbare zeegebieden
 * @returns {Array}
 */
export function getAllSeaAreas() {
  return seaAreas.features;
}


/**
 * Zoek een gebied op naam
 * @param {string} name
 * @returns {object|null}
 */
export function findSeaArea(name) {
  return seaAreas.features.find(feature =>
    feature.properties.name.toLowerCase() === name.toLowerCase()
  ) || null;
}


/**
 * Bereken oppervlakte van een zeegebied
 * @param {object} area GeoJSON Feature
 * @returns {number} km²
 */
export function getSeaAreaSize(area) {
  if (!area) return null;

  return turf.area(area) / 1000000;
}


/**
 * Geef centrumpositie van een zeegebied
 * @param {object} area GeoJSON Feature
 * @returns {[number,number]}
 */
export function getSeaAreaCenter(area) {
  if (!area) return null;

  return turf.centroid(area).geometry.coordinates;
}


/**
 * Complete informatie voor een GPS positie
 * @param {[number, number]} position
 */
export function getMarineContext(position) {
  const area = getSeaArea(position);

  if (!area) {
    return null;
  }

  return {
    name: area.properties.name,
    category: area.properties.category,
    areaKm2: Number(getSeaAreaSize(area).toFixed(2)),
    center: getSeaAreaCenter(area)
  };
}