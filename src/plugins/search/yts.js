const yts = require('yt-search');

module.exports = {
    name: 'YouTube Search',
    category: 'search',
    description: 'Mencari video di YouTube berdasarkan kata kunci',
    method: 'GET',
    parameters: {
        query: 'Kata kunci pencarian video (contoh: ?query=lagu viral)'
    },
    async execute(req, res) {
        const query = req.query.query || req.query.q;

        if (!query) {
            return res.status(400).json({
                status: false,
                message: 'Parameter query atau q wajib diisi'
            });
        }

        try {
            const search = await yts(query);
            const videos = (search.videos || []).slice(0, 15).map(video => ({
                title: video.title,
                videoId: video.videoId,
                url: video.url,
                duration: video.timestamp || video.duration?.toString() || '',
                seconds: video.seconds,
                views: video.views,
                ago: video.ago,
                author: {
                    name: video.author?.name || 'Unknown',
                    url: video.author?.url || ''
                },
                thumbnail: video.thumbnail || video.image || ''
            }));

            res.status(200).json({
                status: true,
                total: videos.length,
                data: videos
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Gagal melakukan pencarian YouTube',
                error: error.message
            });
        }
    }
};
