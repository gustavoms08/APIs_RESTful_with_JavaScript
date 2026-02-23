const db = require('../services/database_connection');

// 1. Buscar todas as comandas
const getComandas = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM comandas');
    
    // Como os itens e a data estão como TEXT no seu SQL, 
    // se você salvou como JSON, pode precisar de um JSON.parse() aqui depois.
    res.status(200).json({
      sucesso: true,
      dados: rows
    });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: error.message });
  }
};

// 2. Criar nova comanda (Enviando para o seu SQL)
const createComanda = async (req, res) => {
  try {
    const { mesa, itens, total } = req.body;

    // Convertendo para String para bater com seu tipo TEXT do SQL
    const itensTexto = JSON.stringify(itens);
    const dataTexto = new Date().toISOString(); 
    const statusPadrao = 'pendente';

    const query = 'INSERT INTO comandas (mesa, itens, total, status, dataPedido) VALUES (?, ?, ?, ?, ?)';
    const valores = [mesa, itensTexto, total, statusPadrao, dataTexto];

    const [resultado] = await db.query(query, valores);

    res.status(201).json({
      sucesso: true,
      id: resultado.insertId,
      mensagem: "Salvo com sucesso no banco!"
    });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: error.message });
  }
};

// 3. Atualizar Status
const updateComandaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query('UPDATE comandas SET status = ? WHERE id = ?', [status, id]);

    res.status(200).json({ sucesso: true, mensagem: 'Status atualizado' });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: error.message });
  }
};

// 4. Deletar Comanda
const deleteComanda = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM comandas WHERE id = ?', [id]);

    res.status(200).json({ sucesso: true, mensagem: 'Comanda removida' });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: error.message });
  }
};

module.exports = {
  getComandas,
  createComanda,
  updateComandaStatus,
  deleteComanda 
};