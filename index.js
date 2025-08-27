import express from 'express'; 
import mysql from 'mysql2';
import cors from 'cors'


const app = express();
const port = 3000;
app.use(cors())


// Middleware para processar JSON nas requisições
app.use(express.json());

// --- Configuração da conexão com o banco de dados ---
const db = mysql.createConnection({
  host: 'localhost',
  user: 'servidorsit',
  password: 'Ay76la08.sit!',
  database: 'SIT_DB'
});

// Conecta ao MySQL
db.connect(err => {
  if (err) {
    console.error('Erro ao conectar com o MySQL:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL.');
});


/////////////////////////////////////////////////////////// --- Rota para Cadastrar um novo contato ---
app.post('/fretes', (req, res) => {
  // 1. Pega os campos do corpo da requisição
  const {
    peso,
    Motorista,
    PlacaVeic,
    Cliente,
    Val_ton,
    dt_frete,
    NTicket,
    CTE,
    N_Nota,
    Fazenda,
    Cidade,
    KM,
    vl_Pedagio
  } = req.body;

  // 2. Validação mais precisa (apenas os campos que são realmente obrigatórios)
  if (!peso || !Motorista || !PlacaVeic || !Cliente || !Val_ton || !dt_frete || !Fazenda) {
    // Retorna uma mensagem de erro clara indicando quais campos faltam se for o caso
    return res.status(400).json({ error: 'Campos como Peso, Motorista, Placa, Cliente, Valor/Ton, Data e Fazenda são obrigatórios.' });
  }

  // 3. (MELHORIA) Calcula o Valor Total do Frete no backend
  // Isso é mais seguro do que confiar no cálculo do App
  const ValTotFrete = parseFloat(peso) * parseFloat(Val_ton);

  // 4. (MELHORIA) Pega a data atual no servidor
  // É mais confiável que a data do celular do usuário
  const DtCad = new Date();

  // 5. Query SQL
  const sql = 'INSERT INTO fretes (peso, Motorista, PlacaVeic, Cliente, Val_ton, dt_frete, ValTotFrete, NTicket, CTE, N_Nota, Fazenda, Cidade, KM, DtCad, vl_Pedagio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
  // 6. Valores para inserir (incluindo os calculados e opcionais com 'null')
  // Usar '|| null' garante que se um campo opcional não for enviado, o banco receberá NULL
  const values = [
    peso,
    Motorista,
    PlacaVeic,
    Cliente,
    Val_ton,
    dt_frete,
    ValTotFrete, // Valor calculado
    NTicket || null,
    CTE || null,
    N_Nota || null,
    Fazenda,
    Cidade || null,
    KM || null,
    DtCad, // Data gerada no servidor
    vl_Pedagio || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir o FRETE:', err);
      return res.status(500).json({ error: 'Erro de servidor ao cadastrar o frete.' });
    }
    res.status(201).json({ message: 'Frete cadastrado com sucesso!', id: result.insertId });
  });
});

///////////////////////////////////////////////////////// --- Rota para Consultar todos os contatos ---
app.get('/fretes', (req, res) => {
  const sql = 'SELECT peso, Motorista, PlacaVeic, Cliente, Val_ton, dt_frete, ValTotFrete, NTicket, CTE, N_Nota, Fazenda, Cidade, KM, DtCad, vl_Pedagio FROM fretes';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao consultar os FRETES:', err);
      return res.status(500).json({ error: 'Erro ao buscar os FRETES.' });
    }
    res.status(200).json(results);
  });
  
});



//////////////////////////////////////////////////////////////// Inicia o servidor
app.listen(port,'0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
