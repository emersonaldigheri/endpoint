import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'servidorsit',
    password: 'Ay76la08.sit!',
    database: 'SIT_DB'
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar com o MySQL:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL.');
});

// --- NOVAS ROTAS DE VALIDAÇÃO ---

// Rota para verificar se um TICKET já existe
app.get('/fretes/check-ticket', (req, res) => {
    const { nTicket } = req.query;
    if (!nTicket) {
        return res.status(400).json({ error: 'Número do ticket não fornecido.' });
    }
    const sql = 'SELECT NTicket FROM fretes WHERE NTicket = ?';
    db.query(sql, [nTicket], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor.' });
        }
        res.json({ exists: results.length > 0 });
    });
});

// Rota para verificar se uma NOTA FISCAL já existe
app.get('/fretes/check-nota', (req, res) => {
    const { nNota } = req.query;
    if (!nNota) {
        return res.status(400).json({ error: 'Número da nota não fornecido.' });
    }
    const sql = 'SELECT N_Nota FROM fretes WHERE N_Nota = ?';
    db.query(sql, [nNota], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor.' });
        }
        res.json({ exists: results.length > 0 });
    });
});


// --- ATUALIZAÇÃO DA ROTA DE CADASTRO DE FRETE ---
app.post('/fretes', (req, res) => {
    // 1. Pega TODOS os campos, incluindo os novos
    const {
        // Campos de seleção
        Motorista, PlacaVeic, Fazenda, Cliente,
        // IDs
        ID_FUNC, ID_FAZENDA, ID_VEICULO, ID_CLIENTE,
        // Valores auto-preenchidos
        Cidade, Val_ton, KM, vl_Pedagio, vl_comb,
        // Valores de referência de data
        Quinz, MesRef,
        // Dados manuais
        peso, NTicket, CTE, N_Nota, dt_frete,
        // Dados de sistema
        hora
    } = req.body;

    // 2. Validação principal (campos essenciais)
    if (!Motorista || !PlacaVeic || !Fazenda || !Cliente || !Val_ton || !peso || !dt_frete) {
        return res.status(400).json({ error: 'Campos essenciais como Motorista, Placa, Fazenda, Cliente, Valor/Ton, Peso e Data são obrigatórios.' });
    }

    // 3. Calcula o Valor Total do Frete no backend
    const ValTotFrete = parseFloat(peso) * parseFloat(Val_ton);
    const DtCad = new Date(); // Data de cadastro gerada no servidor

    // 4. Query SQL com os NOVOS CAMPOS
    const sql = `INSERT INTO fretes (
        peso, Motorista, PlacaVeic, Cliente, Val_ton, dt_frete, ValTotFrete,
        NTicket, CTE, N_Nota, Fazenda, Cidade, KM, DtCad, vl_Pedagio,
        ID_FUNC, ID_FAZENDA, ID_VEICULO, ID_CLIENTE, Quinz, MesRef, vl_comb, hora
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // 5. Valores para inserir (incluindo os novos)
    const values = [
        peso, Motorista, PlacaVeic, Cliente, Val_ton, dt_frete, ValTotFrete,
        NTicket || null, CTE || null, N_Nota || null, Fazenda, Cidade || null, KM || null, DtCad, vl_Pedagio || null,
        ID_FUNC, ID_FAZENDA, ID_VEICULO, ID_CLIENTE, Quinz, MesRef, vl_comb || null, hora
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erro ao inserir o FRETE:', err);
            return res.status(500).json({ error: 'Erro de servidor ao cadastrar o frete.' });
        }
        res.status(201).json({ message: 'Frete cadastrado com sucesso!', id: result.insertId });
    });
});


// --- SUAS OUTRAS ROTAS (GET /fretes, /fazendas, etc.) ---
// ...
// ...

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});



//////////////////////////////////////////////////////////////// Inicia o servidor
app.listen(port,'0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
