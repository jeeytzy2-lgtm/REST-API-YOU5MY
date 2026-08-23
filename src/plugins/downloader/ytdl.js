const axios = require('axios');

class Ytmp3Scraper {
    constructor() {
        this.baseUrl = 'https://a.ymcdn.org/api/v1';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://id.ytmp3.mobi/'
        };
    }

    extractVideoId(url) {
        let match;
        if (url.includes('youtube.com/shorts/') || url.includes('youtu.be/')) {
            match = /\/([a-zA-Z0-9\-_]{11})/.exec(url);
        } else if (url.includes('youtube.com')) {
            match = /v=([a-zA-Z0-9\-_]{11})/.exec(url);
        }
        return match ? match[1] : null;
    }

    async init() {
        const url = `${this.baseUrl}/init?p=y&23=1llum1n471&_=${Math.random()}`;
        const response = await axios.get(url, { headers: this.headers });
        return response.data;
    }

    async convert(convertURL, videoId, format) {
        const url = `${convertURL}&v=${videoId}&f=${format}&_=${Math.random()}`;
        const response = await axios.get(url, { headers: this.headers });
        return response.data;
    }

    async checkProgress(progressURL, maxRetries = 60) {
        let retries = 0;
        let lastResponse = null;

        while (retries < maxRetries) {
            const response = await axios.get(progressURL, { headers: this.headers });
            lastResponse = response.data;

            if (lastResponse.error !== 0) {
                throw new Error(`Progress Error Code: ${lastResponse.error}`);
            }

            if (lastResponse.progress === 3) {
                return lastResponse;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries++;
        }
        throw new Error('Timeout: Konversi memakan waktu terlalu lama.');
    }

    async scrape(youtubeUrl, format = 'mp3') {
        const startTime = Date.now();

        if (!['mp3', 'mp4'].includes(format)) {
            return {
                success: false,
                message: 'Format tidak valid. Gunakan "mp3" atau "mp4".'
            };
        }

        const videoId = this.extractVideoId(youtubeUrl);
        if (!videoId) {
            return {
                success: false,
                message: 'URL YouTube tidak valid atau Video ID tidak ditemukan.'
            };
        }

        const initResponse = await this.init();
        if (initResponse.error !== 0) {
            return {
                success: false,
                message: `Gagal inisialisasi. Error code: ${initResponse.error}`
            };
        }

        const convertResponse = await this.convert(initResponse.convertURL, videoId, format);
        if (convertResponse.error !== 0) {
            return {
                success: false,
                message: `Gagal memulai konversi. Error code: ${convertResponse.error}`
            };
        }

        await this.checkProgress(convertResponse.progressURL);

        return {
            success: true,
            videoId: videoId,
            title: convertResponse.title,
            format: format,
            downloadUrl: convertResponse.downloadURL,
            duration: `${((Date.now() - startTime) / 1000).toFixed(2)}s`
        };
    }
}

module.exports = {
    name: 'YouTube Downloader',
    category: 'downloader',
    description: 'Mengunduh audio MP3 atau video MP4 dari YouTube',
    method: 'GET',
    parameters: {
        url: 'URL video YouTube (contoh: ?url=https://youtube.com/watch?v=...)',
        format: 'Pilihan format: mp3 atau mp4 (default: mp3)'
    },
    async execute(req, res) {
        const url = req.query.url || req.query.link;
        const format = (req.query.format || 'mp3').toLowerCase();

        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'Parameter url atau link wajib diisi'
            });
        }

        try {
            const scraper = new Ytmp3Scraper();
            const result = await scraper.scrape(url, format);

            if (!result.success) {
                return res.status(400).json({
                    status: false,
                    message: result.message
                });
            }

            res.status(200).json({
                status: true,
                data: {
                    title: result.title,
                    videoId: result.videoId,
                    format: result.format,
                    download_url: result.downloadUrl,
                    process_time: result.duration
                }
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Terjadi kesalahan saat memproses unduhan',
                error: error.message
            });
        }
    }
};
