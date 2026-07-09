export default function getJulianDate(date = new Date()) {
    // Get universal time and date
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    const K = date.getUTCFullYear();
    const M = date.getUTCMonth() + 1;
    const I = date.getUTCDate();

    const UT =  hours + (minutes + seconds / 60) / 60;

    return 367 * K - Math.trunc((7 * (K + Math.trunc((M + 9)/ 12)))/ 4) + Math.trunc((275 * M)/ 9) + I + 1721013.5 + UT/ 24;
}