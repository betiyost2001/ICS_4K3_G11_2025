import '../styles/globals.css';
import '../styles/modal.css';

export const metadata = {
  title: 'Parque - Compra de Entradas',
  description: 'Sistema de compra de entradas para el parque',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}