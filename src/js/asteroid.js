import createSphereInstance from './sphere.js';

export default function createAsteroid(data) {
    const estimated_radius_min = data["estimated_diameter"]["kilometers"]["estimated_diameter_min"] / 2;
    const estimated_radius_max = data["estimated_diameter"]["kilometers"]["estimated_diameter_max"] / 2;

    const estimated_average_radius = (estimated_radius_min + estimated_radius_max) / 2;

    const relative_velocity = data["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"];

    const asteroidMesh = createSphereInstance("/images/asteroid.jpg");
    asteroidMesh.scale.set(estimated_average_radius, estimated_average_radius, estimated_average_radius);

    return asteroidMesh;

}