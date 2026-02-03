import { useState, useEffect, useMemo } from 'react';
import { getCardapio, createComanda } from './services/api';
import { PainelCozinha } from './components/PainelCozinha';
import './App.css';

function App() {
  const [cardapio, setCardapio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comanda, setComanda] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [numeromesa, setNumeromesa] = useState(1);
  const [refreshPedidos, setRefreshPedidos] = useState(0);

  useEffect(() => {
    const fetchCardapio = async () => {
      try {
        const response = await getCardapio();
        console.log('✅ Front-end: "Cardápio recebido!"', response.data);
        
        if (response.data.dados) {
          setCardapio(response.data.dados);
        } else {
          setCardapio(response.data);
        }
      } catch (err) {
        console.error('X Front-end: "Erro ao buscar o cardápio"', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardapio();
  }, []);

  const cardapioFiltrado = useMemo(() => {
    if (!termoBusca.trim()) {
      return cardapio;
    }
    
    const termoLower = termoBusca.toLowerCase();
    return cardapio.filter(item => {
      return item.nome.toLowerCase().includes(termoLower) ||
             item.descricao.toLowerCase().includes(termoLower);
    });
  }, [cardapio, termoBusca]);

  const handleLimparBusca = () => {
    setTermoBusca('');
  };

  // Função para adicionar um item ao carrinho com quantidade
  const handleAddItemComanda = (item) => {
    setComanda((prevComanda) => {
      // Verifica se o item já existe na comanda
      const itemExistenteIndex = prevComanda.findIndex(comandaItem => 
        comandaItem.id === item.id
      );
      
      if (itemExistenteIndex !== -1) {
        // Se existe, aumenta a quantidade
        const novaComanda = [...prevComanda];
        novaComanda[itemExistenteIndex] = {
          ...novaComanda[itemExistenteIndex],
          quantidade: novaComanda[itemExistenteIndex].quantidade + 1
        };
        return novaComanda;
      } else {
        // Se não existe, adiciona com quantidade 1
        console.log('✅ Item adicionado à comanda:', item.nome);
        return [...prevComanda, { ...item, quantidade: 1 }];
      }
    });
  };

  // Função para remover item da comanda
  const handleRemoveItemComanda = (indexToRemove) => {
    setComanda((prevComanda) => {
      return prevComanda.filter((_, index) => index !== indexToRemove);
    });
  };

  // Função para diminuir a quantidade de um item na comanda
  const handleDiminuirQuantidade = (index) => {
    setComanda((prevComanda) => {
      const novaComanda = [...prevComanda];
      if (novaComanda[index].quantidade > 1) {
        // Diminui a quantidade se for maior que 1
        novaComanda[index] = {
          ...novaComanda[index],
          quantidade: novaComanda[index].quantidade - 1
        };
      } else {
        // Remove o item se a quantidade for 1
        novaComanda.splice(index, 1);
      }
      return novaComanda;
    });
  };

  // Função para aumentar a quantidade de um item na comanda
  const handleAumentarQuantidade = (index) => {
    setComanda((prevComanda) => {
      const novaComanda = [...prevComanda];
      novaComanda[index] = {
        ...novaComanda[index],
        quantidade: novaComanda[index].quantidade + 1
      };
      return novaComanda;
    });
  };

  // Função para calcular o total da comanda considerando quantidade
  const calcularTotalComanda = () => {
    return comanda.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  // Função para ENVIAR o pedido para o back-end
  const handleFazerPedido = async () => {
    if (comanda.length === 0) {
      alert('Sua comanda está vazia!');
      return;
    }

    // Prepara os itens com quantidade para o back-end
    const itensComQuantidade = comanda.flatMap(item => 
      Array(item.quantidade).fill(item.id)
    );

    const dadosDoPedido = {
      mesa: `Mesa ${numeromesa}`,
      itens: itensComQuantidade,
      total: calcularTotalComanda(),
    };

    try {
      const response = await createComanda(dadosDoPedido);
      console.log('✅ Pedido enviado com sucesso!', response.data);
      alert(`✅ Pedido #${response.data.dados.id} esta sendo preparado`);
      setComanda([]); // Limpa o carrinho
      setNumeromesa(numeromesaSoma => numeromesaSoma + 1);
      setRefreshPedidos(count => count + 1);
    } catch (err) {
      console.error('X Erro ao enviar pedido:', err);
      alert('X Erro ao enviar pedido para a "Cozinha". Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="App">
        <h1>🍽️ Restaurante 🍽️</h1>
        <div className="loading">Carregando o cardápio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <h1>🍽️ Restaurante 🍽️</h1>
        <div className="error">
          <p>X Erro: A "Cozinha" (Back-end) não respondeu.</p>
          <p>Verifique se o servidor está rodando em http://localhost:4000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>🍽️ Cardápio do Restaurante 🍽️</h1>
      <p className="subtitle">Bem-vindo! Confira nossos deliciosos pratos:</p>
      
      {/* Barra de Pesquisa */}
      <div className="barra-pesquisa">
        <div className="pesquisa-container">
          <input
            type="text"
            placeholder="Buscar pratos pelo nome ou descrição..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="input-pesquisa"
          />
          {termoBusca && (
            <button onClick={handleLimparBusca} className="btn-limpar-pesquisa">
              Limpar
            </button>
          )}
        </div>
        <div className="info-pesquisa">
          <span>
            Mostrando {cardapioFiltrado.length} de {cardapio.length} itens
            {termoBusca && ` para "${termoBusca}"`}
          </span>
        </div>
      </div>

      <div className="cardapio-lista">
        {cardapioFiltrado.length === 0 ? (
          <div className="sem-resultados">
            <p>Nenhum prato encontrado para "{termoBusca}"</p>
            <button onClick={handleLimparBusca} className="btn-voltar-todos">
              Ver todos os pratos
            </button>
          </div>
        ) : (
          cardapioFiltrado.map((item) => (
            <div key={item.id} className="cardapio-item">
              <h2>{item.nome}</h2>
              <p className="descricao">{item.descricao}</p>
              <p className="preco">R$ {item.preco.toFixed(2)}</p>
              
              {/* Controle de quantidade para cada produto */}
              <div className="controle-quantidade">
                <button 
                  onClick={() => handleAddItemComanda(item)}
                  className="btn-adicionar-pedido"
                >
                  ➕ Adicionar ao Pedido
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAINEL DA COZINHA */}
      <PainelCozinha refreshTrigger={refreshPedidos} />

      {/* SEÇÃO DA COMANDA (CARRINHO) */}
      <div className="comanda-secao">
        <h2>🛒 Sua Comanda (Carrinho)</h2>
        <div className="comanda-lista">
          {comanda.length === 0 ? (
            <p className="comanda-vazia">Seu carrinho está vazio. Adicione itens do cardápio!</p>
          ) : (
            comanda.map((item, index) => (
              <div key={index} className="comanda-item">
                <div className="comanda-item-info">
                  <span className="comanda-item-nome">{item.nome}</span>
                  <span className="comanda-item-preco">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                    <span className="preco-unitario"> (R$ {item.preco.toFixed(2)} cada)</span>
                  </span>
                </div>
                
                {/* Controles de quantidade na comanda */}
                <div className="controle-quantidade-comanda">
                  <button 
                    onClick={() => handleDiminuirQuantidade(index)}
                    className="btn-quantidade"
                  >
                    -
                  </button>
                  <span className="quantidade-numero">{item.quantidade}</span>
                  <button 
                    onClick={() => handleAumentarQuantidade(index)}
                    className="btn-quantidade"
                  >
                    +
                  </button>
                </div>
                
                <button 
                  onClick={() => handleRemoveItemComanda(index)}
                  className="btn-remover-item"
                >
                  X
                </button>
              </div>
            ))
          )}
        </div>
        <hr />
        <div className="comanda-total">
          <strong>Total: R$ {calcularTotalComanda().toFixed(2)}</strong>
        </div>
        <button
          className="btn-fazer-pedido"
          onClick={handleFazerPedido}
          disabled={comanda.length === 0}
        >
          🍽️ Fazer Pedido
        </button>
      </div>
    </div>
  );
}

export default App;