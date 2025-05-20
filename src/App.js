import React, { useState } from 'react';  // Importa React e hook useState para gerenciar estado local
import './App.css';  // Importa o arquivo CSS com os estilos

function App() {
  // Declara o estado cep para armazenar o valor digitado pelo usuário no input
  const [cep, setCep] = useState('');
  // Estado para armazenar os dados retornados da API do CEP
  const [result, setResult] = useState(null);
  // Estado para armazenar a temperatura atual do local obtida da API do clima
  const [temperature, setTemperature] = useState(null);
  // Estado para armazenar mensagens de erro
  const [error, setError] = useState(null);
  // Estado que indica se a requisição está em andamento, para mostrar loading e desabilitar botão
  const [loading, setLoading] = useState(false);

  // Função chamada quando o formulário é submetido (botão clicado)
  const handleSubmit = async (event) => {
    event.preventDefault(); // Evita que a página recarregue após o submit

    // Inicializa os estados para busca: limpa dados anteriores e seta loading true
    setLoading(true);
    setError(null);
    setResult(null);
    setTemperature(null);

    try {
      // Remove qualquer caractere que não seja dígito do CEP digitado
      const cleanCep = cep.replace(/\D/g, '');

      // Faz a requisição para a API do CEP com o CEP limpo
      const responseCep = await fetch(`https://cep.awesomeapi.com.br/json/${cleanCep}`);

      // Verifica se a resposta foi ok, senão lança erro
      if (!responseCep.ok) {
        throw new Error('CEP não encontrado');
      }

      // Converte a resposta em JSON com os dados do CEP
      const dataCep = await responseCep.json();

      // Atualiza o estado result com os dados do CEP encontrados
      setResult(dataCep);

      // Extrai latitude e longitude dos dados do CEP para usar na próxima requisição
      const { lat, lng } = dataCep;

      // Se latitude ou longitude não estiverem presentes, lança erro
      if (!lat || !lng) {
        throw new Error('Latitude ou Longitude não disponíveis para este CEP');
      }

      // Faz a requisição para a API do clima Open Meteo usando latitude e longitude
      const responseWeather = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m`
      );

      // Verifica se resposta foi ok, se não lança erro
      if (!responseWeather.ok) {
        throw new Error('Erro ao consultar clima');
      }

      // Converte resposta do clima em JSON
      const dataWeather = await responseWeather.json();

      // A API retorna dados horárias em arrays, pega a primeira temperatura atual
      const tempCurrent = (dataWeather?.hourly?.temperature_2m && dataWeather.hourly.temperature_2m[0]) ?? null;

      // Atualiza o estado temperature com o valor da temperatura atual
      setTemperature(tempCurrent);

    } catch (err) {
      // Se ocorreu algum erro, atualiza o estado error para mostrar mensagem ao usuário
      setError(err.message || 'Erro ao consultar dados');
    } finally {
      // Por fim, seta loading false para permitir nova busca
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Título da página */}
      <h1 className="title">Digite seu CEP</h1>
      {/* Formulário com input e botão */}
      <form onSubmit={handleSubmit} className="form">
        {/* Input para digitar o CEP, controlado pelo estado cep */}
        <input
          type="text"
          placeholder="CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value)} // Atualiza estado cep a cada digitação
          maxLength={9} // Limita a 9 caracteres (digitos e hífen)
          pattern="\d{5}-?\d{3}" // Validação no formato 12345-678 ou 12345678
          required
          className="input"
        />
        {/* Botão envia o formulário, desabilitado se estiver carregando */}
        <button type="submit" className="button" disabled={loading}>
          {/* Mostra texto dinâmico dependendo de loading */}
          {loading ? 'Buscando...' : 'Enviar'}
        </button>
      </form>

      {/* Exibe mensagem de erro caso exista */}
      {error && <p style={{ color: 'red', marginTop: 20 }}>{error}</p>}

      {/* Exibe os dados do CEP e temperatura se resultado existir */}
      {result && (
        <div
          className="result"
          style={{
            marginTop: 20,
            textAlign: 'left',
            maxWidth: 320,
            backgroundColor: '#2c2c44',
            padding: 16,
            borderRadius: 8,
          }}
        >
          <p><strong>CEP:</strong> {result.code}</p>
          <p><strong>Endereço:</strong> {result.address}</p>
          <p><strong>Bairro:</strong> {result.district}</p>
          <p><strong>Cidade:</strong> {result.city}</p>
          <p><strong>Estado:</strong> {result.state}</p>
          {/* Só mostra temperatura se ela estiver disponível */}
          {temperature !== null && (
            <p style={{ marginTop: 12, fontWeight: 'bold', fontSize: '1.2rem' }}>
              Temperatura Atual: {temperature}°C
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;  // Exporta o componente como padrão para ser usado pelo React
