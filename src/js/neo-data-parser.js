import createAsteroid from './asteroid.js';

export default async function getNEOData(startDate, endDate) {
    try {
        const response = await fetch(
            `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${import.meta.env.VITE_NASA_API_KEY}`);
        const json = await response.json();
        const data = json.near_earth_objects;

        return data;

    } catch (err) {
        console.error(err);
        return null;
    }
}