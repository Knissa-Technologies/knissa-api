import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 =========================================');
  console.log('🚀 Knissa API');
  console.log(`🚀 Running on http://localhost:${PORT}`);
  console.log('🚀 =========================================');
  console.log('');
});