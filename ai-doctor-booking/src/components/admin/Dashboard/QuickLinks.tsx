'use client';

import Link from 'next/link';

// Icons
const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 20C5 16.134 8.13401 13 12 13C15.866 13 19 16.134 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DoctorsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BookingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 11H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Quick links data
const links = [
  {
    title: 'Gestión de Usuarios',
    description: 'Ver y editar usuarios, permisos y preferencias',
    icon: <UsersIcon />,
    href: '/admin/users',
    bgColor: 'bg-primary bg-opacity-10',
    borderColor: 'border-primary',
    textColor: 'text-primary',
  },
  {
    title: 'Gestión de Doctores',
    description: 'Administrar doctores, especialidades y disponibilidad',
    icon: <DoctorsIcon />,
    href: '/admin/doctors',
    bgColor: 'bg-accent-orange bg-opacity-10',
    borderColor: 'border-accent-orange',
    textColor: 'text-accent-orange',
  },
  {
    title: 'Gestión de Reservas',
    description: 'Ver, confirmar y cancelar reservas',
    icon: <BookingsIcon />,
    href: '/admin/bookings',
    bgColor: 'bg-green-500 bg-opacity-10',
    borderColor: 'border-green-500',
    textColor: 'text-green-500',
  },
];

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {links.map((link, index) => (
        <Link 
          href={link.href}
          key={index}
          className={`
            ${link.bgColor} border ${link.borderColor} border-opacity-30
            rounded-lg p-4 transition-transform hover:transform hover:scale-[1.02] hover:shadow-md
            flex flex-col h-full
          `}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`${link.textColor} ${link.bgColor} p-2 rounded-lg`}>
              {link.icon}
            </div>
            <div className={`${link.textColor}`}>
              <ArrowRightIcon />
            </div>
          </div>
          
          <h3 className="font-semibold text-lg mb-1">{link.title}</h3>
          <p className="text-medium-grey text-sm">{link.description}</p>
        </Link>
      ))}
    </div>
  );
} 