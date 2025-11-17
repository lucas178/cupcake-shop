import React from 'react';
import { Screen, Order } from '../types';
import { SuccessCheckIcon } from './Icons';

interface OrderSuccessScreenProps {
  setScreen: (screen: Screen) => void;
  latestOrder: Order | null;
}

const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({ setScreen, latestOrder }) => {
  if (!latestOrder) {
    return (
      <div className="bg-slate-100 h-full flex flex-col justify-center items-center text-center p-6">
        <p className="text-lg text-slate-500 mb-4">Ocorreu um erro ao exibir o resumo do pedido.</p>
        <button
          onClick={() => setScreen(Screen.Home)}
          className="w-full max-w-xs bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors shadow-lg"
        >
          VOLTAR AO INÍCIO
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 h-full flex flex-col justify-between items-center text-center p-6 animate-fade-in">
      <div className="w-full">
        <div className="flex flex-col items-center justify-center my-8">
          <SuccessCheckIcon />
          <h1 className="text-2xl font-bold text-slate-800 mt-4">Pedido Realizado com Sucesso!</h1>
          <p className="text-slate-600 mt-2">Obrigado por comprar conosco.</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md text-left w-full">
          <h2 className="text-lg font-bold text-slate-700 mb-3 border-b pb-2">Resumo do Pedido</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500">Número do Pedido:</span>
            <span className="font-semibold text-slate-700">#{latestOrder.id.slice(-6)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500">Total Pago:</span>
            <span className="font-bold text-pink-500">R$ {latestOrder.total.toFixed(2)}</span>
          </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-500">Forma de Pagamento:</span>
            <span className="font-semibold text-slate-700">{latestOrder.paymentMethod}</span>
          </div>
          <div className="border-t pt-2">
              {latestOrder.items.map(item => (
                <div key={item.cupcake.id} className="flex justify-between text-sm text-slate-600 py-1">
                    <span>{item.quantity}x {item.cupcake.name}</span>
                    <span className="font-medium">R$ {(item.quantity * item.cupcake.price).toFixed(2)}</span>
                </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full mt-8">
          <button
          onClick={() => setScreen(Screen.Home)}
          className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors shadow-lg"
        >
          VOLTAR AO INÍCIO
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessScreen;