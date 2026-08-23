const fs = require('fs');
const path = require('path');

const pluginsDir = path.join(process.cwd(), 'src', 'plugins');
const plugins = new Map();
let isScanned = false;

function ensureDirectoryExists(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    } catch (error) {}
}

function clearRequireCache(filePath) {
    try {
        delete require.cache[require.resolve(filePath)];
    } catch (error) {}
}

function loadPlugin(filePath) {
    if (!filePath.endsWith('.js')) return null;

    const relative = path.relative(pluginsDir, filePath).replace(/\\/g, '/');
    const parts = relative.split('/');

    if (parts.length !== 2) return null;

    const [category, file] = parts;
    const endpoint = file.replace('.js', '');
    const key = `${category}/${endpoint}`;

    try {
        clearRequireCache(filePath);
        const plugin = require(filePath);

        if (plugin && typeof plugin.execute === 'function') {
            const data = {
                name: plugin.name || endpoint,
                category: category,
                endpoint: endpoint,
                path: `/api/${category}/${endpoint}`,
                method: (plugin.method || 'GET').toUpperCase(),
                description: plugin.description || '',
                parameters: plugin.parameters || {},
                execute: plugin.execute,
                filePath: filePath
            };
            plugins.set(key, data);
            return data;
        }
    } catch (error) {}
    return null;
}

function unloadPlugin(filePath) {
    if (!filePath.endsWith('.js')) return;

    const relative = path.relative(pluginsDir, filePath).replace(/\\/g, '/');
    const parts = relative.split('/');

    if (parts.length !== 2) return;

    const [category, file] = parts;
    const endpoint = file.replace('.js', '');
    const key = `${category}/${endpoint}`;

    clearRequireCache(filePath);
    plugins.delete(key);
}

function scanPlugins() {
    ensureDirectoryExists(pluginsDir);

    if (!fs.existsSync(pluginsDir)) return;

    try {
        const categories = fs.readdirSync(pluginsDir);
        for (const category of categories) {
            const categoryPath = path.join(pluginsDir, category);
            if (fs.statSync(categoryPath).isDirectory()) {
                const files = fs.readdirSync(categoryPath);
                for (const file of files) {
                    if (file.endsWith('.js')) {
                        loadPlugin(path.join(categoryPath, file));
                    }
                }
            }
        }
        isScanned = true;
    } catch (error) {}
}

function initWatcher() {
    scanPlugins();

    if (process.env.VERCEL) {
        return;
    }

    try {
        const chokidar = require('chokidar');
        const watcher = chokidar.watch(pluginsDir, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 100,
                pollInterval: 50
            }
        });

        watcher
            .on('add', (filePath) => loadPlugin(filePath))
            .on('change', (filePath) => loadPlugin(filePath))
            .on('unlink', (filePath) => unloadPlugin(filePath));
    } catch (error) {}
}

function getAllPlugins() {
    if (!isScanned || plugins.size === 0) {
        scanPlugins();
    }
    return Array.from(plugins.values());
}

function getPlugin(category, endpoint) {
    const key = `${category}/${endpoint}`;
    let plugin = plugins.get(key);

    if (!plugin) {
        const filePath = path.join(pluginsDir, category, `${endpoint}.js`);
        if (fs.existsSync(filePath)) {
            plugin = loadPlugin(filePath);
        }
    }

    return plugin || null;
}

module.exports = {
    initWatcher,
    getAllPlugins,
    getPlugin,
    ensureDirectoryExists
};