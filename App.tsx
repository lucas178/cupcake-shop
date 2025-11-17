import React, { useState } from 'react';
import { Screen, CartItem, Cupcake, Order, Address } from './types';
import { CUPCAKE_FLAVORS } from './constants';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import FlavorsScreen from './components/FlavorsScreen';
import OrderScreen from './components/OrderScreen';
import Header from './components/Header';
import OrderSuccessScreen from './components/OrderSuccessScreen';
import AdminScreen from './components/AdminScreen';
import AdminLoginScreen from './components/AdminLoginScreen';

const OrdersScreen: React.FC<{
  setScreen: (screen: Screen) => void;
  orderHistory: Order[];
}> = ({ setScreen, orderHistory }) => (
    <div className="bg-slate-100 flex flex-col h-full">
        <Header title="MEUS PEDIDOS" onBack={() => setScreen(Screen.Home)} />
        <div className="p-6 space-y-4 flex-grow overflow-y-auto">
            {orderHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-slate-500">Nenhum pedido encontrado.</p>
                </div>
            ) : (
                orderHistory.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-lg shadow-md animate-fade-in">
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                            <div>
                                <h3 className="font-bold text-slate-800">Pedido #{order.id.slice(-6)}</h3>
                                <p className="text-xs text-slate-500">{order.date.toLocaleString('pt-BR')}</p>
                            </div>
                            <span className="text-lg font-bold text-pink-500">R$ {order.total.toFixed(2)}</span>
                        </div>
                        <div className="space-y-1 mt-2">
                            {order.items.map(item => (
                                <div key={item.cupcake.id} className="flex justify-between text-sm text-slate-600">
                                    <span>{item.quantity}x {item.cupcake.name}</span>
                                    <span className="font-medium">R$ {(item.quantity * item.cupcake.price).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200/60">
                            <p className="text-xs text-slate-500">
                                Pago com: <span className="font-semibold text-slate-600">{order.paymentMethod}</span>
                            </p>
                            {order.paymentMethod === 'Dinheiro na Entrega' && order.changeDetails?.needsChange && (
                                <p className="text-xs text-slate-500">
                                    Troco para: <span className="font-semibold text-slate-600">R$ {order.changeDetails.forAmount?.toFixed(2)}</span>
                                </p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);


const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.Home);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [cupcakes, setCupcakes] = useState<Cupcake[]>(CUPCAKE_FLAVORS);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const updateCart = (cupcake: Cupcake, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.cupcake.id === cupcake.id);
      if (existingItem) {
        if (quantity === 0) {
          return prevCart.filter(item => item.cupcake.id !== cupcake.id);
        }
        return prevCart.map(item =>
          item.cupcake.id === cupcake.id ? { ...item, quantity } : item
        );
      } else if (quantity > 0) {
        return [...prevCart, { cupcake, quantity }];
      }
      return prevCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  }

  const finalizeOrder = (payload: {
    items: CartItem[];
    total: number;
    paymentMethod: string;
    customer: { name: string, email: string, phone: string };
    address: Address;
    changeDetails?: { needsChange: boolean; forAmount?: number; };
  }) => {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      date: new Date(),
      ...payload
    };
    setOrderHistory(prev => [newOrder, ...prev]);
    setLatestOrder(newOrder);
    clearCart();
    setScreen(Screen.OrderSuccess);
  };
  
  const handleAddCupcake = (cupcake: Omit<Cupcake, 'id' | 'reviews'>) => {
    const newCupcake: Cupcake = {
      ...cupcake,
      id: Date.now(),
      reviews: []
    };
    setCupcakes(prev => [...prev, newCupcake]);
  };

  const handleUpdateCupcake = (updatedCupcake: Cupcake) => {
    setCupcakes(prev => prev.map(c => c.id === updatedCupcake.id ? updatedCupcake : c));
  };
  
  const handleDeleteCupcake = (cupcakeId: number) => {
    setCupcakes(prev => prev.filter(c => c.id !== cupcakeId));
    // Also remove from cart if it exists there
    setCart(prev => prev.filter(item => item.cupcake.id !== cupcakeId));
  };

  const handleLogin = (user: string, pass: string): boolean => {
    if (user === 'admin' && pass === 'admin123') {
        setIsAdminAuthenticated(true);
        setScreen(Screen.Admin);
        return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setScreen(Screen.Home);
  };

  const renderScreen = () => {
    switch (screen) {
      case Screen.Profile:
        return <ProfileScreen setScreen={setScreen} />;
      case Screen.Flavors:
        return <FlavorsScreen setScreen={setScreen} cart={cart} updateCart={updateCart} cupcakes={cupcakes} />;
      case Screen.Orders:
        return <OrdersScreen setScreen={setScreen} orderHistory={orderHistory} />;
      case Screen.Checkout:
        return <OrderScreen setScreen={setScreen} cart={cart} onFinalizeOrder={finalizeOrder} />;
      case Screen.OrderSuccess:
        return <OrderSuccessScreen setScreen={setScreen} latestOrder={latestOrder} />;
      case Screen.AdminLogin:
        return <AdminLoginScreen setScreen={setScreen} onLogin={handleLogin} />;
      case Screen.Admin:
        return isAdminAuthenticated ? (
            <AdminScreen 
                setScreen={setScreen} 
                cupcakes={cupcakes}
                orderHistory={orderHistory}
                onAdd={handleAddCupcake}
                onUpdate={handleUpdateCupcake}
                onDelete={handleDeleteCupcake}
                onLogout={handleLogout}
            />
        ) : (
            <AdminLoginScreen setScreen={setScreen} onLogin={handleLogin} />
        );
      case Screen.Home:
      default:
        return <HomeScreen setScreen={setScreen} />;
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen p-4 bg-slate-900">
      <div className="w-full max-w-sm h-[800px] max-h-[90vh] bg-slate-100 rounded-3xl shadow-2xl overflow-hidden ring-4 ring-slate-700">
        <div className="w-full h-full">
            {renderScreen()}
        </div>
      </div>
    </main>
  );
};

export default App;