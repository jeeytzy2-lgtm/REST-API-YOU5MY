const app = require('./src/server');

const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server berjalan di port ${PORT}`);
    });
}

module.exports = app;