const { getAllPlugins } = require('../../utils/loader');

module.exports = {
    name: 'List Endpoint',
    category: 'info',
    description: 'Menampilkan seluruh daftar endpoint API yang tersedia berdasarkan kategori',
    method: 'GET',
    parameters: {},
    async execute(req, res) {
        try {
            const plugins = getAllPlugins();
            const categorized = {};

            for (const item of plugins) {
                if (!categorized[item.category]) {
                    categorized[item.category] = [];
                }

                categorized[item.category].push({
                    name: item.name,
                    path: item.path,
                    method: item.method,
                    description: item.description,
                    parameters: item.parameters
                });
            }

            res.status(200).json({
                status: true,
                creator: 'JeeyDev',
                total_endpoints: plugins.length,
                total_categories: Object.keys(categorized).length,
                result: categorized
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                creator: 'JeeyDev',
                message: error.message
            });
        }
    }
};
