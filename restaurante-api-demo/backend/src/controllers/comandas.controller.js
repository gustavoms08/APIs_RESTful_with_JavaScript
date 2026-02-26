const db = require('../services/database_connection');

// 1. Buscar todas as comandas do Banco de Dados
const getComandas = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM comandas');
    res.status(200).json({
      sucesso: true,
      mensagem: 'Comandas recuperadas com sucesso',
      quantidade: rows.length,
      dados: rows
    });
  } catch (error) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar comandas', erro: error.message });
  }
};

// 2. Criar nova comanda no Banco de Dados
const createComanda = async (req, res) => {
  try {
    const { mesa, itens, total } = req.body;
    const statusInicial = 'pendente';

    console.log ("mesaaaaaaaaaaaaaaaaaa", mesa)

    // O MySQL não aceita objetos/arrays diretamente, então transformamos em texto (JSON)
    const itensJSON = JSON.stringify(itens);

    // O COMANDO QUE VOCÊ PEDIU:
    const [result] = await db.query(
      'INSERT INTO comandas (mesa, status, itens, total) VALUES (?,? ,? , ?)',
      [mesa, statusInicial, itensJSON, total]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Comanda criada com sucesso no banco!',
      dados: {
        id: result.insertId, // Pega o ID que o MySQL gerou automaticamente
        mesa,
        status: statusInicial,
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar comanda', erro: error.message });
  }
};

// 3. Atualizar Status no Banco de Dados
const updateComandaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.query('UPDATE comandas SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Comanda não encontrada.' });
    }

    res.status(200).json({ sucesso: true, mensagem: 'Status atualizado!' });
  } catch (error) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar', erro: error.message });
  }
};
// 4. Deletar Comanda do Banco de Dados
const deleteComanda = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM comandas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Comanda não encontrada.' });
    }

    res.status(200).json({ sucesso: true, mensagem: 'Comanda deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao deletar', erro: error.message });
  }
};

// Exporta as funções para serem usadas nas rotas
module.exports = {
  getComandas,
  createComanda,
  updateComandaStatus,
  deleteComanda 
};