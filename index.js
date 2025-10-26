import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

// Configuração básica
const app = express();

// Permitir qualquer origem (para testes)
app.use(cors());

// Permitir JSON
app.use(express.json());

const PORT = 12345;

// Config do MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pouchdb',
  waitForConnections: true,
  connectionLimit: 10
});


app.post('/api/ocorrencias/sync', async (req, res) => {
  
  const body = req.body;
  
  if(!(body && body.id && body.acao)){
    console.log('Entrou aqui aqui', body.id, body.acao)
    return res.status(400).json({ success: false, message: 'É necessário id e ação' });
  }

  switch (body.acao) {
    case 'create':
      create(res, body);
      break;
    case 'update':
      update(res, body);
      break;
    case 'delete':
      remove(res, body);
      break;
    case 'read':
      read(res);
      break;
    default:
      return res.status(400).json({ success: false, message: 'Ação desconhecida!' });
  }




});

async function create(res, body) {
  try {

    await pool.query(
      'INSERT INTO ocorrencias (id, data) VALUES (?, ?)',
      [body.id, JSON.stringify(body)]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
  
}

async function update(res, body) {

  try {
  
    const [result] = await pool.query(
      'UPDATE ocorrencias SET data = ? WHERE id = ?',
      [JSON.stringify(body), body.id]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
}

async function remove(res, body) {
   try {
    await pool.query('DELETE FROM ocorrencias WHERE id = ?', [body.id]);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
}

async function read(res) {
  try {
    const [rows] = await pool.query('SELECT * FROM ocorrencias');
    const docs = rows.map(r => ({ ...JSON.parse(r.data) }));
    res.json(docs);
  } catch (err) {
    res.status(500).json({ success: false });
  }
}

// Inicializa tudo
(async () => {
  app.listen(PORT, () => console.log(`Webservice rodando`, PORT));
})();
