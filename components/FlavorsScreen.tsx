import React, { useMemo, useState } from 'react';
import { Screen, Cupcake, CartItem } from '../types';
import Header from './Header';
import { StarIcon, CloseIcon } from './Icons';

interface FlavorsScreenProps {
  setScreen: (screen: Screen) => void;
  cart: CartItem[];
  updateCart: (cupcake: Cupcake, quantity: number) => void;
  cupcakes: Cupcake[];
}

const QuantitySelector: React.FC<{ quantity: number; onQuantityChange: (newQuantity: number) => void }> = ({ quantity, onQuantityChange }) => (
  <div className="flex items-center justify-center bg-slate-200 rounded-full">
    <button
      onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
      className="px-3 py-1 text-lg font-bold text-pink-500 rounded-l-full hover:bg-pink-200 transition-colors"
      aria-label="Diminuir quantidade"
    >
      -
    </button>
    <span className="px-4 py-1 text-slate-800 font-bold">{quantity}</span>
    <button
      onClick={() => onQuantityChange(quantity + 1)}
      className="px-3 py-1 text-lg font-bold text-pink-500 rounded-r-full hover:bg-pink-200 transition-colors"
      aria-label="Aumentar quantidade"
    >
      +
    </button>
  </div>
);

const CupcakeCard: React.FC<{ cupcake: Cupcake; quantity: number; onQuantityChange: (newQuantity: number) => void; onClick: () => void }> = ({ cupcake, quantity, onQuantityChange, onClick }) => (
  <div className="flex items-center bg-white p-3 rounded-lg shadow-md space-x-4">
    <button onClick={onClick} className="flex-shrink-0">
        <img src={cupcake.image} alt={cupcake.name} className="w-16 h-16 rounded-md object-cover" />
    </button>
    <div className="flex-grow cursor-pointer" onClick={onClick}>
      <h3 className="font-bold text-slate-800">{cupcake.name}</h3>
      <p className="text-sm text-pink-500 font-semibold">R$ {cupcake.price.toFixed(2)}</p>
    </div>
    <QuantitySelector quantity={quantity} onQuantityChange={onQuantityChange} />
  </div>
);

const CupcakeDetailModal: React.FC<{
  cupcake: Cupcake;
  onClose: () => void;
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
}> = ({ cupcake, onClose, quantity, onQuantityChange }) => {
  return (
     <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-50 rounded-2xl shadow-2xl p-6 w-full max-w-sm m-4 max-h-[90vh] overflow-y-auto relative flex flex-col space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors z-10">
          <CloseIcon className="h-7 w-7" />
        </button>
        
        <img src={cupcake.image} alt={cupcake.name} className="w-full h-48 rounded-lg object-cover" />

        <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold text-slate-800">{cupcake.name}</h2>
                <p className="text-lg text-pink-500 font-semibold">R$ {cupcake.price.toFixed(2)}</p>
                <p className="text-sm text-slate-500">Aprox. {cupcake.weight}g</p>
            </div>
            <QuantitySelector quantity={quantity} onQuantityChange={onQuantityChange} />
        </div>

        <div>
          <h3 className="font-bold text-slate-700 border-b pb-1 mb-2">Ingredientes</h3>
          <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
            {cupcake.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
        </div>

        <div>
           <h3 className="font-bold text-slate-700 border-b pb-1 mb-2">Avaliações</h3>
            {cupcake.reviews.length > 0 ? (
                <div className="space-y-3">
                {cupcake.reviews.map((review, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm text-slate-800">{review.user}</p>
                        <div className="flex">
                        {[...Array(5)].map((_, j) => <StarIcon key={j} filled={j < review.rating} />)}
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 italic">"{review.comment}"</p>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500 italic">Ainda não há avaliações para este cupcake.</p>
            )}
        </div>
      </div>
    </div>
  )
}


const FlavorsScreen: React.FC<FlavorsScreenProps> = ({ setScreen, cart, updateCart, cupcakes }) => {
  const [selectedCupcake, setSelectedCupcake] = useState<Cupcake | null>(null);
  
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + item.cupcake.price * item.quantity, 0), [cart]);


  const getQuantity = (cupcakeId: number) => {
    return cart.find(item => item.cupcake.id === cupcakeId)?.quantity || 0;
  };

  return (
    <div className="bg-slate-100 h-full flex flex-col">
      <Header title="SABORES" onBack={() => setScreen(Screen.Home)} />
      <div className="p-6 space-y-4 flex-grow overflow-y-auto">
        {cupcakes.map(cupcake => (
          <CupcakeCard
            key={cupcake.id}
            cupcake={cupcake}
            quantity={getQuantity(cupcake.id)}
            onQuantityChange={(quantity) => updateCart(cupcake, quantity)}
            onClick={() => setSelectedCupcake(cupcake)}
          />
        ))}
      </div>
       {totalItems > 0 && (
        <div className="p-6 sticky bottom-0 bg-slate-100 border-t border-slate-200">
            <button 
              onClick={() => setScreen(Screen.Checkout)}
              className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors shadow-lg flex justify-between items-center"
            >
              <span>VER PEDIDO ({totalItems} {totalItems > 1 ? 'itens' : 'item'})</span>
              <span>R$ {totalPrice.toFixed(2)}</span>
            </button>
        </div>
      )}

      {selectedCupcake && (
        <CupcakeDetailModal 
          cupcake={selectedCupcake}
          onClose={() => setSelectedCupcake(null)}
          quantity={getQuantity(selectedCupcake.id)}
          onQuantityChange={(quantity) => updateCart(selectedCupcake, quantity)}
        />
      )}
    </div>
  );
};

export default FlavorsScreen;