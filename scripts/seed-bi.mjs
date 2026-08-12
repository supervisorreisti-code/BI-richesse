import mysql from "mysql2/promise";

// Dados oficiais extraídos de client/src/lib/data.ts (Maio/Junho/Julho)
const LOJAS_LOJA = {
  FLAMBOYANT: "Richesse Flamboyant",
  OESTE: "Richesse Oeste",
  PRIME: "Richesse Prime",
  GELATERIA: "Richesse Gelateria",
  TOGO: "Richesse TOGO",
  MARISTA: "Richesse Marista",
  GOIANIA: "Richesse Goiânia Shopping",
  PARK: "Richesse Park",
  EVENTOS: "Richesse Eventos",
};

const dados = {
  Maio: {
    FLAMBOYANT: [694000, 813808], OESTE: [937000, 1359149], PRIME: [217000, 293964],
    GELATERIA: [166000, 191000], TOGO: [428000, 630455], MARISTA: [513000, 670925],
    GOIANIA: [515000, 650176], PARK: [350000, 592461],
  },
  Junho: {
    FLAMBOYANT: [707000, 810690], OESTE: [931000, 1258616], PRIME: [191000, 242154],
    GELATERIA: [136000, 182577], TOGO: [430000, 565707], MARISTA: [479000, 619622],
    GOIANIA: [502000, 676460], PARK: [336000, 546350],
  },
  Julho: {
    FLAMBOYANT: [787000, 980779], OESTE: [876000, 1516955], PRIME: [170000, 315386],
    GELATERIA: [177000, 226954], TOGO: [375000, 624479], MARISTA: [473000, 695647],
    GOIANIA: [527000, 790397], PARK: [390000, 581174], EVENTOS: [286000, 350000],
  },
};

// Rankings oficiais (nome, vendas) por periodo → loja
const rankings = {
  Maio: {
    FLAMBOYANT: [["Natia Cristina Saldanha",108000],["Naiane Souza",98000],["Karolyne De Sousa",93000],["Maria Raimunda",81000],["Denize Dos Santos Silva",78000],["Francisca Rodrigues",68000],["Luciana De Kassia",67000],["Ireny Alves",65000]],
    OESTE: [["Natia Cristina Saldanha",108000],["Naiane Souza",98000],["Karolyne De Sousa",93000],["Maria Raimunda",81000],["Denize Dos Santos Silva",78000],["Francisca Rodrigues",68000],["Luciana De Kassia",67000],["Ireny Alves",65000]],
    PRIME: [["Rayssa Lorrany",58000],["Eliana Miguel De Morais",46000],["Celismar Cunha Cavalcante",44000],["Michele Gomes Pereira",33000],["Daniela De Sousa",15000],["Jusimeire De Rocha",5000]],
    GELATERIA: [["Luscineide",88000],["Jaqueline",78000]],
    TOGO: [["Maria Sthfanny Dos Reis",79000],["Bianca Vaz",68000],["Caroline Sousa",67000],["Diana Mendes",60000],["Davi Mendes",51000],["Estefane Lustosa",27000],["Adelio Junio",24000],["Kamille Jenifer",17000]],
    MARISTA: [["Mylena Dos Santos",125000],["Joelma Cristina",104000],["Bruna Fernanda",65000],["Itamara Araujo",65000],["Daniel Silva",57000],["Nathalia Silva",50000],["Bianca Dos Santos Luz",18000]],
    GOIANIA: [["Alexander Machado De Almeida",90000],["Leticia Cordoval",65000],["Ana Paula Amaral",65000],["Cassiane Eva Pinto",64000],["Wellingyhon Dos Santos",62000],["Karen Lainy Ferreira",61000],["Ana Tereza Freitas",52000],["Nathalia Medeiros",16000]],
    PARK: [["Isabela De Jesus",82000],["Jessica Yasmin Rodrigues",80000],["Marcela Lorrany",52000],["Nyckolas Alessandro",46000],["Felipe De Sousa",20000],["Paulo Ricardo",15000],["Jaqueline Alves",12000],["Ana Clara Carvalho",12000]],
  },
  Junho: {
    FLAMBOYANT: [["Luciana",101000],["Cintia",93000],["Steffany",68000],["Gabriel",57000],["Helen",55000],["Lays",48000],["Micaelly",47000],["Elen",40000]],
    MARISTA: [["Milena",110000],["Daniela",88000],["Itamara",68000],["Bruna",68000],["Nathalia",58000],["Julia",50000],["Bianca",18000],["Joelma",11000]],
    TOGO: [["Caroline",79000],["Diana",70000],["Bianca",65000],["Maria",63000],["Kamille",46000],["Davi",36000],["Adelio",35000],["Estefane",19000]],
    GELATERIA: [["Lusineide",69000],["Jaqueline",64000],["Nikelly",3000]],
    PRIME: [["Rayssa",48000],["Eliana",44000],["Celisnar",40000],["Michele",34000],["Daniela",11000],["Adriana",8000],["Jusimeire",4000],["Flavia",241.18]],
    PARK: [["Isabela",76000],["Marcela",61000],["Jessica",38000],["Nyckolas",34000],["Jennifer",30000],["Sabrina",28000],["Jaqueline",16000],["Waldir",15000]],
    GOIANIA: [["Letícia",63000],["Ana",61000],["Karen",59000],["Cassiane",59000],["Wellington",56000],["Thyayla",49000],["Alexander",48000],["Ana",47000]],
    OESTE: [["Karolyne",126000],["Naiane",114000],["Natia",95000],["Dayane",78000],["Naykele",73000],["Denize",73000],["Naydes",59000],["Davi",56000]],
  },
  Julho: {
    FLAMBOYANT: [["Luciana",114000],["Cintia",92000],["Steffany",80000],["Helen",69000],["Gabriel",65000],["Elen",59000],["Gabriel",58000],["Micaelly",55000]],
    MARISTA: [["Mylena",77000],["Daniel",65000],["Nathalia",62000],["Bruna",58000],["Joelma",49000],["Itamara",48000],["Jaina",41000],["Maria",29000]],
    TOGO: [["Kamille",53000],["Elainny",51000],["Caroline",50000],["Diana",41000],["Adriana",37000],["Adelio",35000],["Michelle",21000],["Syang",18000]],
    GELATERIA: [["Lusineide",90000],["Jaqueline",87000]],
    PRIME: [["Eliana",42000],["Rayssa",41000],["Celisnar",39000],["Michele",33000],["Jusimeire",4000],["Juliana",4000],["Daniela",3000],["Adriana",3000]],
    PARK: [["Isabela",78000],["Marcela",67000],["Jennifer",55000],["Sabrina",51000],["Nyckolas",46000],["Stefane",33000],["Ana",18000],["Waldir",12000]],
    GOIANIA: [["Alexander",99000],["Wellington",66000],["Letícia",64000],["Ana",58000],["Karen",56000],["Kemelli",52000],["Cassiane",46000],["Thyayla",35000]],
    OESTE: [["Karolyne",128000],["Denize",84000],["Natia",78000],["Dayane",70000],["Naykele",60000],["Naydes",49000],["Sabrina",48000],["Naiane",47000]],
    EVENTOS: [["Ludmila",286000]],
  },
};

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Limpa dados antigos (seed idempotente)
await conn.query("DELETE FROM lojas_periodos");
await conn.query("DELETE FROM ranking_vendedores");

for (const [periodo, lojas] of Object.entries(dados)) {
  for (const [chave, [vendas, meta]] of Object.entries(lojas)) {
    await conn.execute(
      "INSERT INTO lojas_periodos (periodo, loja, vendas_total, meta) VALUES (?, ?, ?, ?)",
      [periodo, LOJAS_LOJA[chave], vendas, meta]
    );
  }
}

for (const [periodo, lojas] of Object.entries(rankings)) {
  for (const [chave, vendedores] of Object.entries(lojas)) {
    for (let i = 0; i < vendedores.length; i++) {
      const [nome, vendas] = vendedores[i];
      await conn.execute(
        "INSERT INTO ranking_vendedores (periodo, loja, posicao, vendedor, vendas, is_deleted) VALUES (?, ?, ?, ?, ?, 0)",
        [periodo, LOJAS_LOJA[chave], i + 1, nome, Math.round(vendas * 100) / 100]
      );
    }
  }
}

const [lp] = await conn.query("SELECT periodo, COUNT(*) AS n FROM lojas_periodos GROUP BY periodo");
const [rv] = await conn.query("SELECT periodo, COUNT(*) AS n FROM ranking_vendedores GROUP BY periodo");
console.log("lojas_periodos:", lp);
console.log("ranking_vendedores:", rv);
await conn.end();
