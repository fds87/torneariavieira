// Dados canónicos do negócio (NAP) usados em SEO, JSON-LD e dados estruturados
// consumidos por motores de busca e agentes de IA (Google, Gemini, GPT, etc.).

export const SITE_URL = 'https://torneariavieiraoficial.com.br'

export const business = {
  name: 'Tornearia Vieira',
  legalName: 'Tornearia Vieira',
  description:
    'Fabricação de peças industriais sob desenho com usinagem CNC de alta precisão: eixos, buchas, conjuntos mecânicos, ponteiras e componentes para injetoras. Tolerâncias micrométricas e nacionalização de peças importadas.',
  url: SITE_URL,
  email: 'orcamento@torneariavieiraoficial.com.br',
  telephone: '+55-41-99803-5540',
  whatsapp: 'https://wa.me/5541998035540',
  facebook: 'https://www.facebook.com/profile.php?id=100095592520678',
  logo: `${SITE_URL}/logo-dark.png`,
  city: 'São José dos Pinhais',
  region: 'PR',
  regionName: 'Paraná',
  country: 'BR',
  areaServed: 'Brasil',
  priceRange: 'Sob orçamento',
} as const

// Organização + negócio local. Renderizado em todas as páginas (app.vue).
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${SITE_URL}/#organization`,
    name: business.name,
    legalName: business.legalName,
    description: business.description,
    url: business.url,
    email: business.email,
    telephone: business.telephone,
    logo: business.logo,
    image: business.logo,
    priceRange: business.priceRange,
    address: {
      '@type': 'PostalAddress',
      addressLocality: business.city,
      addressRegion: business.region,
      addressCountry: business.country,
    },
    areaServed: { '@type': 'Country', name: business.areaServed },
    knowsAbout: [
      'Usinagem CNC',
      'Fabricação de peças sob desenho',
      'Tornearia industrial',
      'Eixos usinados',
      'Buchas de bronze',
      'Componentes para injetoras',
      'Nacionalização de peças importadas',
    ],
    sameAs: [business.facebook],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: business.email,
      telephone: business.telephone,
      areaServed: business.country,
      availableLanguage: ['Portuguese'],
    },
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: business.name,
    url: business.url,
    inLanguage: 'pt-BR',
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}
