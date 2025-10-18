import Header from '../components/Header';
import TicketForm from '../components/TicketForm';

export default function Home() {
  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <div className="welcome-section">
          <h1>Bienvenido a EcoHarmony Park</h1>
          <p>Disfruta de la naturaleza en armonía con el medio ambiente</p>
        </div>
      </div>
      <TicketForm />
    </div>
  );
}