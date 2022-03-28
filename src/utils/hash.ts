export default function hash(obj: Object | null) {
    if (obj === null) {
        return null;
    }
    const str = JSON.stringify(obj);
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        hash = (hash << 5) - hash + code;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
