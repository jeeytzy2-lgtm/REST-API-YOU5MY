const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'Struktur File Tree',
    category: 'info',
    description: 'Menampilkan struktur file dan folder project dalam format JSON hierarki dan visual array yang rapi',
    method: 'GET',
    parameters: {
        format: 'Format output: json atau text (opsional, default: json)'
    },
    async execute(req, res) {
        try {
            const rootDir = process.cwd();
            const exclude = [
                'node_modules',
                '.git',
                '.vercel',
                '___vc',
                '.output',
                '.npm',
                '.cache',
                'tmp',
                'logs',
                '.env'
            ];

            let totalFiles = 0;
            let totalFolders = 0;
            const visualLines = [];

            function isExcluded(name) {
                return exclude.includes(name) || name.startsWith('.') || name.startsWith('___');
            }

            function buildHierarchy(currentDir) {
                const result = {};
                try {
                    const items = fs.readdirSync(currentDir).filter(item => !isExcluded(item));

                    const folders = [];
                    const files = [];

                    items.forEach(item => {
                        const fullPath = path.join(currentDir, item);
                        try {
                            const stats = fs.statSync(fullPath);
                            if (stats.isDirectory()) {
                                folders.push(item);
                            } else {
                                files.push(item);
                            }
                        } catch (e) {}
                    });

                    folders.sort();
                    files.sort();

                    folders.forEach(folder => {
                        totalFolders++;
                        result[folder] = buildHierarchy(path.join(currentDir, folder));
                    });

                    if (files.length > 0) {
                        totalFiles += files.length;
                        result.files = files;
                    }
                } catch (e) {}
                return result;
            }

            function buildVisualTree(currentDir, prefix = '') {
                try {
                    const items = fs.readdirSync(currentDir).filter(item => !isExcluded(item));

                    const folders = [];
                    const files = [];

                    items.forEach(item => {
                        const fullPath = path.join(currentDir, item);
                        try {
                            const stats = fs.statSync(fullPath);
                            if (stats.isDirectory()) {
                                folders.push(item);
                            } else {
                                files.push(item);
                            }
                        } catch (e) {}
                    });

                    folders.sort();
                    files.sort();

                    const allItems = [
                        ...folders.map(f => ({ name: f, isDir: true })),
                        ...files.map(f => ({ name: f, isDir: false }))
                    ];

                    allItems.forEach((item, index) => {
                        const isLast = index === allItems.length - 1;
                        const symbol = isLast ? '└── ' : '├── ';
                        const fullPath = path.join(currentDir, item.name);

                        visualLines.push(`${prefix}${symbol}${item.name}${item.isDir ? '/' : ''}`);

                        if (item.isDir) {
                            const nextPrefix = prefix + (isLast ? '    ' : '│   ');
                            buildVisualTree(fullPath, nextPrefix);
                        }
                    });
                } catch (e) {}
            }

            const structure = buildHierarchy(rootDir);
            buildVisualTree(rootDir);

            if (req.query.format === 'text') {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                return res.status(200).send(['.', ...visualLines].join('\n'));
            }

            res.status(200).json({
                status: true,
                creator: 'JeeyDev',
                result: {
                    total_folders: totalFolders,
                    total_files: totalFiles,
                    structure: structure,
                    tree_view: visualLines
                }
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                creator: 'JeeyDev',
                message: 'Gagal memproses struktur direktori',
                error: error.message
            });
        }
    }
};
