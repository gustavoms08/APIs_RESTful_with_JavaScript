const db = require('../config/db'); // Verifique se o caminho para sua conexão com o banco está correto

const usuarioController = {
    // Função para listar todos os usuários
    listarUsuarios: (req, res) => {
        const query = 'SELECT id, nome, email FROM usuarios'; // Ajuste 'usuarios' para o nome da sua tabela

        db.query(query, (err, resultados) => {
            if (err) {
                console.error('Erro ao buscar usuários:', err);
                return res.status(500).json({
                    sucesso: false,
                    mensagem: 'Erro ao buscar usuários no banco de dados.'
                });
            }

            // Retorna os dados no formato que o seu ListaUsuarios.jsx espera
            return res.status(200).json({
                sucesso: true,
                usuarios: resultados
            });
        });
    },

    // Você pode adicionar outras funções aqui (criar, deletar, etc) no futuro
};

module.exports = usuarioController;