import "dotenv/config";

import app from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║          KNISSA API v1.0             ║
╠══════════════════════════════════════╣
║ Server : http://localhost:${PORT}
║ Status : Running 🚀
╚══════════════════════════════════════╝
`);
});