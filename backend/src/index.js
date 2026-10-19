const app = require('./server');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor EcoHarmony Park ejecutándose en http://localhost:${PORT}`);
});