import createAsteroid from './neo';

// Get NEO close approaches based on date
export async function getNEOList(startDate, endDate) {
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

// Get data about NEO based on ID from the small body lookup database
export async function getNEOData(id) {
    try {
        const response = await fetch(
            `https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${import.meta.env.VITE_NASA_API_KEY}`);
        const data = await response.json();

        return data;

    } catch (err) {
        console.error(err);
        return null;
    }
}