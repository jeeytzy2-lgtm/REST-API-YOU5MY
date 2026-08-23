const fs = require('fs');
const path = require('path');

const dbDir = path.join(process.cwd(), 'src', 'database');

function ensureDirectoryExists() {
    try {
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
    } catch (error) {}
}

function resolvePath(filename) {
    ensureDirectoryExists();
    const safeName = filename.endsWith('.json') ? filename : `${filename}.json`;
    return path.join(dbDir, safeName);
}

function read(filename, defaultData = {}) {
    const filePath = resolvePath(filename);
    try {
        if (!fs.existsSync(filePath)) {
            write(filename, defaultData);
            return defaultData;
        }
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw);
    } catch (error) {
        write(filename, defaultData);
        return defaultData;
    }
}

function write(filename, data) {
    const filePath = resolvePath(filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        return false;
    }
}

function get(filename, key = null, defaultValue = null) {
    const data = read(filename);
    if (!key) return data;
    return data[key] !== undefined ? data[key] : defaultValue;
}

function set(filename, key, value) {
    const data = read(filename);
    data[key] = value;
    return write(filename, data);
}

function del(filename, key) {
    const data = read(filename);
    if (data[key] !== undefined) {
        delete data[key];
        return write(filename, data);
    }
    return false;
}

function push(filename, key, item) {
    const data = read(filename);
    if (!Array.isArray(data[key])) {
        data[key] = [];
    }
    data[key].push(item);
    return write(filename, data);
}

module.exports = {
    read,
    write,
    get,
    set,
    del,
    push
};