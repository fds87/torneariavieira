/**
 * Seed de produtos da Tornearia Vieira.
 * Para regenerar seed.sql: npx tsx src/db/seed.ts > src/db/seed.sql
 * Para aplicar local: npm run db:seed:local
 * Para aplicar remoto: npm run db:seed
 */

const products = [
  {
    slug: 'ponteira-injetora-padrao',
    name: 'Ponteira para Injetora Padrão',
    category: 'injetora',
    description:
      'Ponteira usinada em aço de alta qualidade para máquinas injetoras de plástico. ' +
      'Fabricada sob tolerâncias micrométricas com acabamento superficial Ra 0,8. ' +
      'Disponível em múltiplos diâmetros, sob encomenda conforme desenho técnico do cliente.',
    material: 'Aço SAE 4140 Temperado',
    price: 350,
    priceMin: 250,
    priceMax: 850,
    imageUrl: 'https://torneariavieiraoficial.com.br/wp-content/uploads/2025/11/ponteira-com-anel-de-bloqueio-2.png',
    inStock: true,
    weightG: 800,
    lengthCm: 25,
    widthCm: 8,
    heightCm: 8,
  },
  {
    slug: 'bucha-bronze-tm620',
    name: 'Bucha de Bronze TM620',
    category: 'bucha',
    description:
      'Bucha de deslizamento em bronze TM620 com tolerâncias controladas. ' +
      'Alta resistência ao desgaste para aplicações em movimento contínuo. ' +
      'Usinada sob medida conforme especificação do cliente. Ideal para guias, mancais e buchas de centragem.',
    material: 'Bronze TM620',
    price: 180,
    priceMin: 80,
    priceMax: 600,
    imageUrl: 'https://torneariavieiraoficial.com.br/wp-content/uploads/2025/11/buchas-de-bronze.png',
    inStock: true,
    weightG: 600,
    lengthCm: 15,
    widthCm: 10,
    heightCm: 10,
  },
  {
    slug: 'sacador-especial',
    name: 'Sacador Especial sob Medida',
    category: 'conjunto',
    description:
      'Sacador em aço temperado e revenido, usinado com precisão sob especificação técnica. ' +
      'Desenvolvido para aplicações industriais exigentes onde ferramentas padrão não atendem. ' +
      'Entregue com certificado de dureza HRC. Prazo conforme complexidade do projeto.',
    material: 'Aço D6 Temperado',
    price: 0,
    priceMin: 400,
    priceMax: 2000,
    imageUrl: 'https://torneariavieiraoficial.com.br/wp-content/uploads/2025/11/sacador.png',
    inStock: true,
    weightG: 1200,
    lengthCm: 30,
    widthCm: 12,
    heightCm: 12,
  },
  {
    slug: 'eixo-transmissao',
    name: 'Eixo de Transmissão sob Medida',
    category: 'eixo',
    description:
      'Eixos de transmissão usinados em torno CNC com tolerâncias h6/H7. ' +
      'Fabricados em aço SAE 1045 ou 4140 conforme aplicação. ' +
      'Acabamento retificado quando necessário. Roscas, rasgos de chaveta e furos axiais sob desenho.',
    material: 'Aço SAE 1045 / SAE 4140',
    price: 0,
    priceMin: 300,
    priceMax: 3000,
    imageUrl: null,
    inStock: true,
    weightG: 2000,
    lengthCm: 60,
    widthCm: 10,
    heightCm: 10,
  },
  {
    slug: 'conjunto-mecanico',
    name: 'Conjunto Mecânico Industrial',
    category: 'conjunto',
    description:
      'Conjuntos mecânicos completos fabricados sob desenho técnico. ' +
      'Inclui usinagem de todos os componentes, montagem e entrega do conjunto pronto para instalação. ' +
      'Especialidade em nacionalização de peças importadas sem desenho, a partir de amostra física.',
    material: 'Conforme especificação do projeto',
    price: 0,
    priceMin: 800,
    priceMax: 15000,
    imageUrl: null,
    inStock: true,
    weightG: 5000,
    lengthCm: 40,
    widthCm: 30,
    heightCm: 20,
  },
]

// Generate seed.sql
const lines: string[] = [
  '-- Gerado por src/db/seed.ts -- nao editar manualmente',
  'DELETE FROM order_items;',
  'DELETE FROM orders;',
  'DELETE FROM products;',
  '',
  'INSERT INTO products (slug, name, category, description, material, price, price_min, price_max, image_url, in_stock, weight_g, length_cm, width_cm, height_cm) VALUES',
]

const escape = (s: string) => s.replace(/'/g, "''")
const sqlStr = (v: string | undefined | null) => v ? `'${escape(v)}'` : 'NULL'

const valueRows = products.map((p, i) => {
  const comma = i < products.length - 1 ? ',' : ';'
  return (
    `  ('${escape(p.slug)}', '${escape(p.name)}', '${escape(p.category)}', ` +
    `'${escape(p.description)}', '${escape(p.material)}', ` +
    `${p.price}, ${p.priceMin}, ${p.priceMax}, ${sqlStr(p.imageUrl)}, ${p.inStock ? 1 : 0}, ` +
    `${p.weightG}, ${p.lengthCm}, ${p.widthCm}, ${p.heightCm})${comma}`
  )
})

lines.push(...valueRows)

console.log(lines.join('\n'))
