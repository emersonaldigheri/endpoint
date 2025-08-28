import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcrypt';
import multer from 'multer'; // Importa o multer para upload de arquivos
import path from 'path';   // Importa o path para lidar com caminhos de arquivos
import fs from 'fs';       // Importa o File System para criar a pasta de uploads

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- CRIA A PASTA DE UPLOADS SE ELA NÃO EXISTIR ---
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}
// Torna a pasta 'uploads' acessível publicamente para que as imagens possam ser vistas
app.use('/uploads', express.static('uploads'));


// --- Configuração da conexão com o banco de dados ---
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


// --- CONFIGURAÇÃO DO MULTER PARA UPLOAD DE IMAGENS ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Define a pasta onde os arquivos serão salvos
    },
    filename: function (req, file, cb) {
        // Cria um nome de arquivo único para evitar que um arquivo substitua outro
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'ticket-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


// --- ROTA DE LOGIN (SEGURA COM BCRYPT) ---
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Login e senha são obrigatórios.' });
    }
    const sql = 'SELECT id, nome, setor, senha, liberado FROM usuarios WHERE Login = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro interno no servidor.' });
        if (results.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
        
        const user = results[0];
        if (user.liberado !== 'S') return res.status(403).json({ error: 'Este usuário está inativo.' });

        const passwordMatch = await bcrypt.compare(password, user.senha);
        if (passwordMatch) {
            const userToken = { id: user.id, nome: user.nome, setor: user.setor };
            res.status(200).json({ message: 'Login bem-sucedido!', token: userToken });
        } else {
            res.status(401).json({ error: 'Senha incorreta.' });
        }
    });
});


// --- ROTA DE CADASTRO DE FRETE (ATUALIZADA COM UPLOAD DE IMAGEM) ---
app.post('/fretes', upload.single('ticket_image'), (req, res) => {
    // 'upload.single('ticket_image')' processa UM arquivo enviado no campo 'ticket_image'
    
    // Os campos de texto do formulário vêm em req.body
    const {
        Motorista, PlacaVeic, Fazenda, ID_FUNC, ID_FAZENDA, ID_VEICULO, ID_CLIENTE,
        Cliente, Cidade, Val_ton, KM, vl_Pedagio, vl_comb, Quinz, MesRef,
        peso, NTicket, CTE, N_Nota, dt_frete, hora
    } = req.body;
    
    // As informações do arquivo (se enviado) vêm em req.file
    // Se nenhuma imagem for enviada, req.file será undefined
    const imagem_ticket_url = req.file ? req.file.path : null;

    // Validação dos campos essenciais
    if (!Motorista || !PlacaVeic || !Fazenda || !Cliente || !Val_ton || !peso || !dt_frete) {
        return res.status(400).json({ error: 'Campos essenciais são obrigatórios.' });
    }

    const ValTotFrete = parseFloat(peso) * parseFloat(Val_ton);
    const DtCad = new Date();

    const sql = `INSERT INTO fretes (
        peso, Motorista, PlacaVeic, Cliente, Val_ton, dt_frete, ValTotFrete,
        NTicket, CTE, N_Nota, Fazenda, Cidade, KM, DtCad, vl_Pedagio,
        ID_FUNC, ID_FAZENDA, ID_VEICULO, ID_CLIENTE, Quinz, MesRef, vl_comb, hora,
        imagem_ticket_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        peso, Motorista, PlacaVeic, Cliente, Val_ton, dt_frete, ValTotFrete,
        NTicket || null, CTE || null, N_Nota || null, Fazenda, Cidade || null, KM || null, DtCad, vl_Pedagio || null,
        ID_FUNC, ID_FAZENDA, ID_VEICULO, ID_CLIENTE, Quinz, MesRef, vl_comb || null, hora,
        imagem_ticket_url // Adiciona o caminho da imagem no final
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erro ao inserir o FRETE:', err);
            return res.status(500).json({ error: 'Erro de servidor ao cadastrar o frete.' });
        }
        res.status(201).json({ message: 'Frete cadastrado com sucesso!', id: result.insertId });
    });
});

// --- SUAS OUTRAS ROTAS (GET) ---

// Rota para buscar todas as fazendas
app.get('/fazendas', (req, res) => {
    const sql = 'SELECT * FROM fazendas ORDER BY nome';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar fazendas:', err);
            return res.status(500).json({ error: 'Erro ao buscar dados.' });
        }
        res.status(200).json(results);
    });
});

// Rota para buscar todos os veículos
app.get('/veiculos', (req, res) => {
    const sql = 'SELECT * FROM veiculos ORDER BY placa';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar veículos:', err);
            return res.status(500).json({ error: 'Erro ao buscar dados.' });
        }
        res.status(200).json(results);
    });
});

// Rota para buscar todos os motoristas
app.get('/motoristas', (req, res) => {
    const sql = 'SELECT * FROM motoristas ORDER BY nome';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar motoristas:', err);
            return res.status(500).json({ error: 'Erro ao buscar dados.' });
        }
        res.status(200).json(results);
    });
});

// Rota para buscar todos os usuários (sem a senha, por segurança)
app.get('/usuarios', (req, res) => {
    // IMPORTANTE: NUNCA retorne a coluna de senha para o aplicativo!
    const sql = 'SELECT id, nome, Login, setor, liberado FROM usuarios ORDER BY nome';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuários:', err);
            return res.status(500).json({ error: 'Erro ao buscar dados.' });
        }
        res.status(200).json(results);
    });
});

// Rota para buscar MesRef e Quinzena por data exata
app.get('/mesref/by-date', (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Data não fornecida.' });
    const sql = 'SELECT mesref AS MesRef, quinzena AS Quinz FROM mesref WHERE DATA = ? LIMIT 1';
    db.query(sql, [date], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor.' });
        if (results.length > 0) res.json(results[0]);
        else res.status(404).json({ error: 'Nenhum período encontrado.' });
    });
});

// Rotas de verificação de duplicidade
app.get('/fretes/check-ticket', (req, res) => {
    const { nTicket } = req.query;
    const sql = 'SELECT NTicket FROM fretes WHERE NTicket = ?';
    db.query(sql, [nTicket], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor.' });
        res.json({ exists: results.length > 0 });
    });
});

app.get('/fretes/check-nota', (req, res) => {
    const { nNota } = req.query;
    const sql = 'SELECT N_Nota FROM fretes WHERE N_Nota = ?';
    db.query(sql, [nNota], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor.' });
        res.json({ exists: results.length > 0 });
    });
});

//////////////////////////////////////////////////////////////// Inicia o servidor
app.listen(port,'0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
