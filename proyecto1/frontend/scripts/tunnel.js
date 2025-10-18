import localtunnel from 'localtunnel';

const startTunnel = async () => {
  const port = 3000; // el mismo puerto que usa "next dev"
  const tunnel = await localtunnel({ port });

  console.log(`🚀 Tu app está disponible públicamente en: ${tunnel.url}`);
  console.log(`🌐 Redirige a http://localhost:${port}`);

  tunnel.on('close', () => {
    console.log('❌ Tunnel cerrado');
  });
};

startTunnel();
