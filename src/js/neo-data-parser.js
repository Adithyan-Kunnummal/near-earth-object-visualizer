import createAsteroid from './asteroid.js';

export default async function data() {
    try {
        const response = await fetch(
            `https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08&api_key=${import.meta.env.VITE_NASA_API_KEY}`);
        const json = await response.json();
        const astData = json.near_earth_objects['2015-09-08'][0];

        return createAsteroid(astData);

    } catch (err) {
        console.error(err);
        return null;
    }
}