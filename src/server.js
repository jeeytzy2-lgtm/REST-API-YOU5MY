const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initWatcher, getPlugin, ensureDirectoryExists } = require('./utils/loader');
const { getHtml } = require('./views/ui');
const db = require('./utils/database');

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

const app = express();

ensureDirectoryExists(path.join(process.cwd(), 'src', 'database'));
ensureDirectoryExists(path.join(process.cwd(), 'src', 'media'));
ensureDirectoryExists(path.join(process.cwd(), 'src', 'plugins'));

initWatcher();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/media', express.static(path.join(process.cwd(), 'src', 'media'), { maxAge: '1d' }));

function recordVisitor(req) {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '';
    const ip = rawIp.split(',')[0].trim().replace(/^::ffff:/, '') || 'unknown';

    const defaultData = { total: 0, unique: 0, ips: [] };
    const data = db.read('visitors', defaultData);

    data.total = (data.total || 0) + 1;

    if (!Array.isArray(data.ips)) {
        data.ips = [];
    }

    if (!data.ips.includes(ip) && ip !== 'unknown') {
        data.ips.push(ip);
        data.unique = data.ips.length;
        if (data.ips.length > 5000) {
            data.ips = data.ips.slice(-5000);
        }
    } else if (!data.unique) {
        data.unique = data.ips.length || 1;
    }

    db.write('visitors', data);
    return { total: data.total, unique: data.unique };
}

app.get('/favicon.ico', (req, res) => {
    const iconPath = path.join(process.cwd(), 'src', 'media', 'Z3PH.png');
    if (fs.existsSync(iconPath)) {
        res.setHeader('Content-Type', 'image/png');
        return res.sendFile(iconPath);
    }
    res.status(204).end();
});

app.use((req, res, next) => {
    req.setTimeout(25000, () => {
        if (!res.headersSent) {
            res.status(504).json({
                status: false,
                creator: 'JeeyDev',
                message: 'Request timeout: Server membatalkan proses karena melebihi batas waktu.'
            });
        }
    });
    next();
});

app.get('/', (req, res) => {
    const visitorStats = recordVisitor(req);

    const accept = req.headers['accept'] || '';
    const wantsJson = req.query.json === 'true' || (accept.includes('application/json') && !accept.includes('text/html'));

    if (!wantsJson) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(getHtml());
    }

    const now = new Date();
    const formattedTime = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'full',
        timeStyle: 'long'
    }).format(now);

    res.status(200).json({
        status: true,
        creator: 'JeeyDev',
        message: 'REST API Server Aktif',
        time: formattedTime,
        visitors: {
            total: visitorStats.total,
            unique: visitorStats.unique
        },
        endpoint_list: '/api/info/listendp'
    });
});

app.all('/api/:category/:endpoint', async (req, res) => {
    const { category, endpoint } = req.params;
    const plugin = getPlugin(category, endpoint);

    if (!plugin) {
        return res.status(404).json({
            status: false,
            creator: 'JeeyDev',
            message: `Endpoint /api/${category}/${endpoint} tidak ditemukan`
        });
    }

    const allowedMethod = (plugin.method || 'GET').toUpperCase();
    if (req.method !== allowedMethod && allowedMethod !== 'ALL') {
        return res.status(405).json({
            status: false,
            creator: 'JeeyDev',
            message: `Metode ${req.method} tidak diizinkan. Gunakan metode ${allowedMethod}`
        });
    }

    try {
        await plugin.execute(req, res);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                status: false,
                creator: 'JeeyDev',
                message: 'Terjadi kesalahan pada server',
                error: error.message
            });
        }
    }
});

app.use((req, res) => {
    res.status(404).json({
        status: false,
        creator: 'JeeyDev',
        message: 'Rute tidak ditemukan'
    });
});

app.use((err, req, res, next) => {
    if (!res.headersSent) {
        res.status(500).json({
            status: false,
            creator: 'JeeyDev',
            message: 'Internal Server Error',
            error: err.message
        });
    }
});

module.exports = app;
