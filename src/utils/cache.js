const cacheStore = new Map();

function set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    cacheStore.set(key, { value, expiresAt });
    return value;
}

function get(key) {
    const item = cacheStore.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
        cacheStore.delete(key);
        return null;
    }

    return item.value;
}

function has(key) {
    return get(key) !== null;
}

function del(key) {
    return cacheStore.delete(key);
}

function clear() {
    cacheStore.clear();
}

module.exports = {
    set,
    get,
    has,
    del,
    clear
};
