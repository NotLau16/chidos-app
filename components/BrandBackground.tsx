"use client";

import React from "react";

// Doodles de estilo Street Food en línea dorada (#F5B800) inspirados en la estética oficial de Chido's

export function FriesDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="#F5B800"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Caja de papas */}
      <path d="M 32 92 L 46 182 L 114 182 L 128 92" />
      {/* Escote frontal curvado de la caja */}
      <path d="M 32 92 Q 80 122 128 92" />
      {/* Pliegues de la caja */}
      <path d="M 46 182 L 58 118" strokeDasharray="3 3" opacity="0.6" />
      <path d="M 114 182 L 102 118" strokeDasharray="3 3" opacity="0.6" />
      
      {/* Papas fritas saliendo a distintos ángulos */}
      <path d="M 36 92 L 32 32 L 42 30 L 46 96" />
      <path d="M 32 32 L 37 27 L 42 30" />
      <path d="M 48 96 L 46 16 L 56 14 L 58 100" />
      <path d="M 46 16 L 51 11 L 56 14" />
      <path d="M 60 100 L 62 8 L 72 8 L 71 102" />
      <path d="M 75 103 L 78 4 L 88 5 L 86 103" />
      <path d="M 90 103 L 95 18 L 105 21 L 100 101" />
      <path d="M 104 100 L 112 32 L 122 36 L 115 95" />
      <path d="M 118 92 L 126 48 L 136 52 L 126 88" />
      <path d="M 52 42 L 64 36 L 74 44" opacity="0.7" />
      <path d="M 82 46 L 94 40 L 104 48" opacity="0.7" />
    </svg>
  );
}

export function BurgerDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="#F5B800"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Pan Superior (Domo) */}
      <path d="M 24 74 C 24 24 176 24 176 74 Z" />
      
      {/* Semillas de sésamo en el pan */}
      <ellipse cx="64" cy="42" rx="4" ry="2" transform="rotate(-15 64 42)" fill="#F5B800" fillOpacity="0.6" />
      <ellipse cx="100" cy="34" rx="4" ry="2" fill="#F5B800" fillOpacity="0.6" />
      <ellipse cx="136" cy="44" rx="4" ry="2" transform="rotate(18 136 44)" fill="#F5B800" fillOpacity="0.6" />
      <ellipse cx="78" cy="56" rx="3.5" ry="1.8" transform="rotate(10 78 56)" fill="#F5B800" fillOpacity="0.6" />
      <ellipse cx="120" cy="56" rx="3.5" ry="1.8" transform="rotate(-12 120 56)" fill="#F5B800" fillOpacity="0.6" />
      
      {/* Capa de Lechuga Ondulada */}
      <path d="M 16 78 Q 26 88 36 78 Q 46 88 56 78 Q 68 88 78 78 Q 88 88 98 78 Q 108 88 118 78 Q 128 88 138 78 Q 148 88 158 78 Q 168 88 178 78 Q 186 86 184 90 Q 176 92 16 88 Z" />
      
      {/* Rodajas de Tomate */}
      <path d="M 28 92 Q 64 88 98 92 L 98 100 Q 64 96 28 100 Z" />
      <path d="M 104 92 Q 138 88 172 92 L 172 100 Q 138 96 104 100 Z" />
      
      {/* Queso Cheddar fundido goteando */}
      <path d="M 22 102 L 68 102 L 78 122 L 90 102 L 138 102 L 150 120 L 160 102 L 178 102 L 174 108 L 24 108 Z" />
      
      {/* Medallón de carne grueso */}
      <path d="M 20 108 C 14 114 14 128 20 134 L 180 134 C 186 128 186 114 180 108 Z" />
      {/* Marcas de parrilla */}
      <line x1="50" y1="117" x2="70" y2="125" opacity="0.6" />
      <line x1="95" y1="117" x2="115" y2="125" opacity="0.6" />
      <line x1="140" y1="117" x2="160" y2="125" opacity="0.6" />
      
      {/* Pan Inferior */}
      <path d="M 26 136 L 174 136 C 178 158 162 166 146 168 L 54 168 C 38 166 22 158 26 136 Z" />
    </svg>
  );
}

export function SandwichDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="#F5B800"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Pan rústico superior (tipo baguette/ciabatta) */}
      <path d="M 20 68 C 24 26 196 26 200 68 Z" />
      
      {/* Cortes diagonales de horneado en la corteza */}
      <path d="M 52 44 Q 62 54 66 62" />
      <path d="M 92 38 Q 102 50 106 60" />
      <path d="M 132 38 Q 142 50 146 60" />
      <path d="M 168 44 Q 176 52 178 62" />
      
      {/* Hebras de carne desmechada asomando */}
      <path d="M 14 72 Q 24 66 36 74 Q 48 66 60 76 Q 74 68 88 77 Q 102 68 116 77 Q 130 68 144 75 Q 158 66 172 76 Q 186 68 206 72" />
      <path d="M 20 78 Q 30 84 44 80 Q 58 88 72 82 Q 86 90 100 84 Q 116 91 130 83 Q 146 90 160 82 Q 174 89 188 83 Q 198 88 202 78" opacity="0.8" />
      
      {/* Hebras y queso fundido descolgando */}
      <path d="M 46 82 Q 50 100 55 84" />
      <path d="M 80 84 Q 85 106 92 86" />
      <path d="M 120 84 Q 125 104 132 86" />
      <path d="M 160 83 Q 165 102 171 85" />
      
      {/* Pan inferior */}
      <path d="M 20 88 L 200 88 C 204 114 186 122 160 124 L 60 124 C 34 122 16 114 20 88 Z" />
    </svg>
  );
}

export function FlameDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="#F5B800"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 50 12 C 56 34 78 42 78 66 C 78 90 58 108 50 108 C 42 108 22 90 22 66 C 22 50 32 40 38 32 C 39 42 44 46 47 48 C 44 36 46 22 50 12 Z" />
      <path d="M 50 56 C 54 66 62 72 62 82 C 62 92 54 98 50 98 C 46 98 38 92 38 82 C 38 74 44 70 46 66 C 47 71 49 73 50 73 C 49 67 49 61 50 56 Z" opacity="0.75" />
    </svg>
  );
}

export default function BrandBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Marca de Agua Central del Isotipo Oficial Chido's en Escala de Grises */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/chidos-logo-full.jpg"
          alt=""
          className="w-[360px] sm:w-[520px] md:w-[680px] lg:w-[820px] max-w-none grayscale opacity-[0.08] md:opacity-[0.10] mix-blend-screen transform -rotate-2 scale-105"
        />
      </div>

      {/* 2. Doodles Vectoriales Street Food Dorados en Esquinas y Márgenes */}
      
      {/* Superior Izquierda: Papas Fritas (igual que en la foto oficial) */}
      <div className="absolute -top-4 -left-4 sm:top-2 sm:left-4 opacity-[0.24] transform -rotate-12">
        <FriesDoodle className="w-28 h-36 sm:w-36 sm:h-44 md:w-52 md:h-64" />
      </div>

      {/* Superior Derecha: Sándwich Desmechado con cortes de pan rústico */}
      <div className="absolute -top-4 -right-6 sm:top-4 sm:right-6 opacity-[0.22] transform rotate-12">
        <SandwichDoodle className="w-36 h-28 sm:w-48 sm:h-36 md:w-64 md:h-48" />
      </div>

      {/* Lateral Izquierdo: Hamburguesa con queso goteando y sésamo */}
      <div className="hidden md:block absolute top-[42%] -left-12 opacity-[0.20] transform rotate-6">
        <BurgerDoodle className="w-44 h-40 lg:w-56 lg:h-48" />
      </div>

      {/* Lateral Derecho: Papas Fritas */}
      <div className="hidden md:block absolute top-[46%] -right-10 opacity-[0.20] transform -rotate-6">
        <FriesDoodle className="w-40 h-52 lg:w-52 lg:h-64" />
      </div>

      {/* Inferior Izquierda: Llama Chido's */}
      <div className="absolute bottom-6 left-2 sm:left-8 opacity-[0.22] transform -rotate-6">
        <FlameDoodle className="w-20 h-24 sm:w-28 sm:h-32 md:w-36 md:h-40" />
      </div>

      {/* Inferior Derecha: Hamburguesa (igual que en la foto oficial) */}
      <div className="absolute -bottom-6 -right-6 sm:bottom-4 sm:right-6 opacity-[0.25] transform -rotate-12">
        <BurgerDoodle className="w-32 h-28 sm:w-44 sm:h-40 md:w-60 md:h-54" />
      </div>

      {/* Resplandor ambiental cálido */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/[0.04] rounded-full blur-[150px]" />
    </div>
  );
}
