import React from 'react';
import VideoProcessor from './components/VideoProcessor';
import PythonLogo from "./assets/img/pythonLogo.svg";

const App: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <main className="flex-1 p-6">
        <section className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">RenderEstimation</h1>
          <p className="text-lg text-gray-700 mb-6">
            O RenderEstimation é uma ferramenta avançada de pose estimation que realiza análise de movimento e estimativa de pose a partir de vídeos. Utilizando técnicas de visão computacional e aprendizado de máquina, ele permite:
          </p>
          <div className="list-disc list-inside mb-6 text-gray-700">
            <p>🚀 Detectar e rastrear pontos chave do corpo em tempo real.</p>
            <p>🚀 Calcular ângulos entre articulações para análise detalhada.</p>
            <p>🚀 Gerar dados precisos e exportá-los em formato CSV para análise posterior.</p>
          </div>
          <p className="text-lg text-gray-700">
            Para melhor precisão dos dados, o vídeo deve ser limpo e conter apenas a pessoa em movimento. Utilize nossa interface para processar vídeos e obter insights valiosos sobre os movimentos.
          </p>

          <div className='w-56 mt-5'>
          <a
          href="https://cdn.discordapp.com/attachments/1014579504716455958/1269405431613100085/main.zip?ex=66aff16f&is=66ae9fef&hm=d15d3fcf5cc32dcc0d0a9ddf04db0ad44fa198ef3886b2c9cf3ae245fa2e1f64&"  
          download="RenderEstimation_Python.zip"
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 transition mb-4"
        >
          Disponivel tambem em Python
          <img src={PythonLogo} alt="Python Logo" className="w-10 h-10 pl-2" />
        </a>
          </div>
        </section>
        <VideoProcessor />
      </main>

    </div>
  );
}

export default App;
