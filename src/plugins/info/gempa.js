module.exports = {
    name: 'Gempa Terkini',
    category: 'info',
    description: 'Menampilkan data gempa bumi terbaru secara real-time dari BMKG',
    method: 'GET',
    parameters: {},
    async execute(req, res) {
        try {
            const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
            
            if (!response.ok) {
                return res.status(502).json({
                    status: false,
                    message: 'Gagal mengambil data dari server BMKG'
                });
            }

            const json = await response.json();
            const gempa = json.Infogempa?.gempa;

            if (!gempa) {
                return res.status(404).json({
                    status: false,
                    message: 'Data gempa tidak ditemukan'
                });
            }

            res.status(200).json({
                status: true,
                data: {
                    tanggal: gempa.Tanggal,
                    jam: gempa.Jam,
                    datetime: gempa.DateTime,
                    coordinates: gempa.Coordinates,
                    lintang: gempa.Lintang,
                    bujur: gempa.Bujur,
                    magnitude: gempa.Magnitude,
                    kedalaman: gempa.Kedalaman,
                    wilayah: gempa.Wilayah,
                    potensi: gempa.Potensi,
                    dirasakan: gempa.Dirasakan,
                    shakemap: `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`
                }
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Terjadi kesalahan pada server',
                error: error.message
            });
        }
    }
};
