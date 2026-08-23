const axios = require('axios');

async function searchPinterest(query) {
    const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?data=${encodeURIComponent(JSON.stringify({ options: { query } }))}`;
    const res = await axios.head(url, {
        headers: {
            'screen-dpr': '4',
            'x-pinterest-pws-handler': 'www/search/[scope].js',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000,
        validateStatus: () => true
    });

    const linkHeader = res.headers['link'] || '';
    return [...linkHeader.matchAll(/<(https:\/\/i\.pinimg\.com\/[^>]+)>/g)].map(m => m[1]);
}

module.exports = {
    name: 'Pinterest Search',
    category: 'search',
    description: 'Mencari gambar dari Pinterest berdasarkan kata kunci',
    method: 'GET',
    parameters: {
        query: 'Kata kunci pencarian gambar (contoh: ?query=gojo satoru)',
        limit: 'Batas jumlah gambar (opsional, default: 10, maks: 30)'
    },
    async execute(req, res) {
        const query = req.query.query || req.query.q;
        const rawLimit = req.query.limit;

        if (!query) {
            return res.status(400).json({
                status: false,
                message: 'Parameter query atau q wajib diisi'
            });
        }

        const limit = rawLimit ? Math.min(Math.max(parseInt(rawLimit) || 10, 1), 30) : 10;

        try {
            const results = await searchPinterest(query);

            if (!results.length) {
                return res.status(404).json({
                    status: false,
                    message: 'Gambar tidak ditemukan untuk kata kunci tersebut'
                });
            }

            const finalData = results.slice(0, limit);

            res.status(200).json({
                status: true,
                query: query,
                total: finalData.length,
                data: finalData
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Terjadi kesalahan saat mengambil gambar Pinterest',
                error: error.message
            });
        }
    }
};
