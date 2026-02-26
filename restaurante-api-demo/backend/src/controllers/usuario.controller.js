const db = require('../services/database_connection');

// 1. Função que retorna TODO o cardápio (Todas as linhas)
const listarCardapio = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cardapio');

    res.json({
      sucesso: true,
      cardapio: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar cardápio' });
  }
};

// 2. Função que retorna um ITEM ESPECÍFICO (Filtrando pela coluna ID)
const getCardapioItem = async (req, res) => {
  try {
    const id = req.params.id; // Pega o ID que vem na URL

    // Fazemos a query usando "?" para evitar SQL Injection (segurança)
    const [rows] = await db.query('SELECT * FROM cardapio WHERE id = ?', [id]);

    // Se o banco não retornar nada para esse ID
    if (rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Item não encontrado no banco de dados'
      });
    }

    // Retorna apenas o primeiro item encontrado (rows[0])
    res.json({
      sucesso: true,
      item: rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar item no banco',
      erro: error.message
    });
  }
};

// Não esqueça de exportar as DUAS funções!
module.exports = {
  listarCardapio,
  getCardapioItem
};