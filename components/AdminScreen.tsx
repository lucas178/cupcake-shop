import React, { useState, useMemo } from 'react';
import { Screen, Cupcake, Order } from '../types';
import { EditIcon, DeleteIcon } from './Icons';

interface AdminScreenProps {
    setScreen: (screen: Screen) => void;
    cupcakes: Cupcake[];
    orderHistory: Order[];
    onAdd: (cupcake: Omit<Cupcake, 'id' | 'reviews'>) => void;
    onUpdate: (cupcake: Cupcake) => void;
    onDelete: (id: number) => void;
    onLogout: () => void;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
            isActive
                ? 'bg-pink-500 text-white shadow-inner'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
        }`}
    >
        {label}
    </button>
);

const FlavorsManager: React.FC<Pick<AdminScreenProps, 'cupcakes' | 'onAdd' | 'onUpdate' | 'onDelete'>> = ({ cupcakes, onAdd, onUpdate, onDelete }) => {
    const emptyCupcakeForm = { name: '', price: '', image: '', ingredients: '', weight: '' };
    const [formState, setFormState] = useState(emptyCupcakeForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (cupcake: Cupcake) => {
        setEditingId(cupcake.id);
        setFormState({
            name: cupcake.name,
            price: cupcake.price.toString(),
            image: cupcake.image,
            ingredients: cupcake.ingredients.join('\n'),
            weight: cupcake.weight.toString(),
        });
        window.scrollTo(0, 0);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este cupcake?')) {
            onDelete(id);
        }
    };

    const resetForm = () => {
        setFormState(emptyCupcakeForm);
        setEditingId(null);
        setError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, price, image, ingredients, weight } = formState;
        if (!name || !price || !image || !ingredients || !weight) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        const priceNumber = parseFloat(price);
        const weightNumber = parseInt(weight, 10);

        if (isNaN(priceNumber) || priceNumber <= 0) {
            setError('O preço deve ser um número válido.');
            return;
        }
        if (isNaN(weightNumber) || weightNumber <= 0) {
            setError('O peso deve ser um número válido.');
            return;
        }

        const cupcakeData = { name, price: priceNumber, image, ingredients: ingredients.split('\n').filter(ing => ing.trim() !== ''), weight: weightNumber };
        
        if (editingId !== null) {
            const existing = cupcakes.find(c => c.id === editingId);
            if (existing) onUpdate({ ...cupcakeData, id: editingId, reviews: existing.reviews });
        } else {
            onAdd(cupcakeData);
        }
        resetForm();
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">{editingId ? 'Editar Cupcake' : 'Adicionar Novo Cupcake'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formState.name} onChange={handleInputChange} placeholder="Nome do Cupcake" className="w-full p-2 border rounded-md" />
                    <div className="flex space-x-2">
                         <input name="price" type="number" step="0.01" value={formState.price} onChange={handleInputChange} placeholder="Preço (Ex: 8.50)" className="w-1/2 p-2 border rounded-md" />
                         <input name="weight" type="number" value={formState.weight} onChange={handleInputChange} placeholder="Peso (g) Ex: 100" className="w-1/2 p-2 border rounded-md" />
                    </div>
                    <input name="image" value={formState.image} onChange={handleInputChange} placeholder="URL da Imagem" className="w-full p-2 border rounded-md" />
                    <textarea name="ingredients" value={formState.ingredients} onChange={handleInputChange} placeholder="Ingredientes (um por linha)" className="w-full p-2 border rounded-md" rows={4}></textarea>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex space-x-2">
                        <button type="submit" className="w-full bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">{editingId ? 'Salvar' : 'Adicionar'}</button>
                        {editingId && <button type="button" onClick={resetForm} className="w-full bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-400">Cancelar</button>}
                    </div>
                </form>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Lista de Sabores</h2>
                <div className="space-y-3">
                    {cupcakes.map(cupcake => (
                        <div key={cupcake.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-slate-800">{cupcake.name}</p>
                                <p className="text-sm text-pink-500">R$ {cupcake.price.toFixed(2)} - {cupcake.weight}g</p>
                            </div>
                            <div className="flex space-x-3">
                                <button onClick={() => handleEdit(cupcake)} className="text-slate-500 hover:text-blue-600"><EditIcon /></button>
                                <button onClick={() => handleDelete(cupcake.id)} className="text-slate-500 hover:text-red-600"><DeleteIcon /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const OrderHistory: React.FC<{ orders: Order[] }> = ({ orders }) => (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        {orders.length === 0 ? <p className="text-slate-500 text-center">Nenhum pedido encontrado.</p> :
            orders.map(order => (
                <div key={order.id} className="p-3 bg-slate-50 rounded-lg border">
                    <div className="flex justify-between items-start pb-2 mb-2 border-b">
                        <div>
                           <p className="font-bold text-slate-800">{order.customer.name}</p>
                           <p className="text-xs text-slate-500">{order.customer.email} | {order.customer.phone}</p>
                           <p className="text-xs text-slate-500 mt-1">Pedido #{order.id.slice(-6)} - {order.date.toLocaleDateString('pt-BR')}</p>
                        </div>
                        <span className="font-bold text-pink-500">R$ {order.total.toFixed(2)}</span>
                    </div>
                     <div className="text-xs text-slate-600 space-y-1">
                        {order.items.map(item => <p key={item.cupcake.id}>{item.quantity}x {item.cupcake.name}</p>)}
                     </div>
                     <div className="text-xs text-slate-500 mt-2 pt-2 border-t">
                        <p><strong>Pagamento:</strong> {order.paymentMethod}</p>
                        {order.paymentMethod === 'Dinheiro na Entrega' && order.changeDetails?.needsChange && (
                            <p className="font-semibold text-blue-600">
                                Troco para: R$ {order.changeDetails.forAmount?.toFixed(2)}
                            </p>
                        )}
                        <p><strong>Endereço:</strong> {order.address.street}, {order.address.number}, {order.address.city} - {order.address.state}</p>
                     </div>
                </div>
            ))
        }
    </div>
);

const UserManagement: React.FC<{ orders: Order[] }> = ({ orders }) => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const ordersByUser = useMemo(() => {
        return orders.reduce((acc, order) => {
            const email = order.customer.email;
            if (!acc[email]) {
                acc[email] = { name: order.customer.name, phone: order.customer.phone, orders: [] };
            }
            acc[email].orders.push(order);
            return acc;
        }, {} as Record<string, { name: string; phone: string; orders: Order[] }>);
    }, [orders]);

    const userEmails = Object.keys(ordersByUser);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
             {userEmails.length === 0 ? <p className="text-slate-500 text-center">Nenhum cliente encontrado.</p> :
                userEmails.map(email => (
                    <div key={email}>
                        <button onClick={() => setSelectedUser(selectedUser === email ? null : email)} className="w-full text-left p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                            <p className="font-bold text-slate-800">{ordersByUser[email].name}</p>
                            <p className="text-sm text-slate-500">{email}</p>
                             <p className="text-sm text-slate-500">{ordersByUser[email].phone}</p>
                            <p className="text-xs text-pink-500 mt-1">{ordersByUser[email].orders.length} pedido(s)</p>
                        </button>
                        {selectedUser === email && (
                           <div className="p-3 mt-2 space-y-3 animate-fade-in">
                               <OrderHistory orders={ordersByUser[email].orders} />
                           </div>
                        )}
                    </div>
                ))
             }
        </div>
    );
};


const AdminScreen: React.FC<AdminScreenProps> = ({ cupcakes, orderHistory, onAdd, onUpdate, onDelete, onLogout }) => {
    const [activeTab, setActiveTab] = useState('flavors');

    return (
        <div className="bg-slate-100 h-full flex flex-col">
            <div className="relative flex items-center justify-center p-4 border-b bg-white">
                <h1 className="text-xl font-bold text-slate-700 tracking-wider uppercase">Painel Administrativo</h1>
                <button onClick={onLogout} className="absolute right-4 bg-red-500 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm">
                    Sair
                </button>
            </div>
            
            <div className="flex">
                <TabButton label="Sabores" isActive={activeTab === 'flavors'} onClick={() => setActiveTab('flavors')} />
                <TabButton label="Pedidos" isActive={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                <TabButton label="Usuários" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            </div>

            <div className="p-6 flex-grow overflow-y-auto">
                {activeTab === 'flavors' && <FlavorsManager cupcakes={cupcakes} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} />}
                {activeTab === 'orders' && <OrderHistory orders={orderHistory} />}
                {/* FIX: Corrected typo from `active-tab` to `activeTab` to match the state variable name. */}
                {activeTab === 'users' && <UserManagement orders={orderHistory} />}
            </div>
        </div>
    );
};

export default AdminScreen;