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
  host: '191.252.181.110',
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
  const { nome, fone, ddd, email } = req.body;

  if (!nome || !fone || !ddd || !email) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  const sql = 'INSERT INTO fretes (peso, Motorista, PlacaVeic, Cliente, Val_ton, dt_frete, ValTotFrete, NTicket, CTE, N_Nota, Fazenda, Cidade, KM, DtCad, vl_Pedagio ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?, ?, ?, ?)';
  db.query(sql, [peso, Motorista, PlacaVeic, Cliente, Val_ton, dt_frete, ValTotFrete, NTicket, CTE, N_Nota, Fazenda, Cidade, KM, DtCad, vl_Pedagio], (err, result) => {
    if (err) {
      console.error('Erro ao inserir o o FRETE:', err);
      return res.status(500).json({ error: 'Erro ao cadastrar o FRETE.' });
    }
    res.status(201).json({ message: 'FRETE cadastrado com sucesso!', id: result.insertId });
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