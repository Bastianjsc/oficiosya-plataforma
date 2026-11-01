import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1b3b2c] text-white pt-16 pb-8 border-t-4 border-[#e8c582] mt-auto">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-extrabold text-[#e8c582] mb-4">OficiosYa</h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              La red de profesionales más confiable de la Región Metropolitana. Conectamos talento local con quienes lo necesitan, ya sea a domicilio o en sucursales físicas.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Plataforma</h3>
            <ul className="space-y-3 text-sm text-gray-300 font-medium">
              <li><Link to="/buscar" className="hover:text-[#e8c582] transition-colors">Buscar Profesionales</Link></li>
              <li><Link to="/registro" className="hover:text-[#e8c582] transition-colors">Ofrecer mis Servicios</Link></li>
              <li><Link to="/login" className="hover:text-[#e8c582] transition-colors">Iniciar Sesión</Link></li>
              <li><Link to="/" className="hover:text-[#e8c582] transition-colors">Volver al Inicio</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Soporte y Legal</h3>
            <ul className="space-y-3 text-sm text-gray-300 font-medium">
              {/* Estos enlaces podrían dirigir a una vista de texto estático en el futuro */}
              <li><a href="#" className="hover:text-[#e8c582] transition-colors">Políticas de Privacidad (Ley N° 19.628)</a></li>
              <li><a href="#" className="hover:text-[#e8c582] transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-[#e8c582] transition-colors">Centro de Ayuda</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contacto</h3>
            <ul className="space-y-4 text-sm text-gray-300 font-medium">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#e8c582] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span>contacto@oficiosya.cl</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#e8c582] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span>+56 9 1234 5678</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#e8c582] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>Santiago, Chile</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-600 pt-8 flex justify-center text-center">
          <p className="text-sm text-gray-400 font-semibold">
            © {currentYear} OficiosYa. Proyecto de Título en Ingeniería. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;