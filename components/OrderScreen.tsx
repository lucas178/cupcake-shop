import React, { useState, useMemo } from 'react';
import { Screen, CartItem, Address } from '../types';
import Header from './Header';
import { CheckboxIcon, ChevronDownIcon, CreditCardIcon, PixIcon, CashIcon, CopyIcon } from './Icons';

interface OrderScreenProps {
  setScreen: (screen: Screen) => void;
  cart: CartItem[];
  onFinalizeOrder: (payload: {
    items: CartItem[];
    total: number;
    paymentMethod: string;
    customer: { name: string, email: string, phone: string };
    address: Address;
    changeDetails?: { needsChange: boolean; forAmount?: number; };
  }) => void;
}

const DELIVERY_FEE = 5.00;

const FormInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; className?: string, type?: string, maxLength?: number }> = 
({ label, name, value, onChange, placeholder, className, type = 'text', maxLength }) => (
    <div className={className}>
        <label htmlFor={name} className="text-sm font-semibold text-slate-500 px-1">{label}</label>
        <input 
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full p-3 mt-1 bg-black text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition placeholder:text-slate-400"
        />
    </div>
);

const PaymentOption: React.FC<{ label: string; icon: React.ReactNode; isSelected: boolean; onClick: () => void }> = 
({ label, icon, isSelected, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
            isSelected ? 'border-pink-500 bg-pink-50' : 'border-slate-300 bg-white hover:bg-slate-50'
        }`}
    >
        <div className={`mr-3 ${isSelected ? 'text-pink-500' : 'text-slate-500'}`}>{icon}</div>
        <span className={`font-semibold ${isSelected ? 'text-pink-600' : 'text-slate-700'}`}>{label}</span>
    </button>
);


const OrderScreen: React.FC<OrderScreenProps> = ({ setScreen, cart, onFinalizeOrder }) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [discount, setDiscount] = useState(0);

  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [isCustomerOpen, setIsCustomerOpen] = useState(true);
  const [customerError, setCustomerError] = useState('');

  const [address, setAddress] = useState<Address>({ street: '', number: '', city: '', state: '', zip: '' });
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [addressError, setAddressError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentDetailsError, setPaymentDetailsError] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [isPixCopied, setIsPixCopied] = useState(false);
  
  const [needsChange, setNeedsChange] = useState<string | null>(null); // 'yes' or 'no'
  const [changeForAmount, setChangeForAmount] = useState('');
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const activeCart = useMemo(() => cart.filter(item => item.quantity > 0), [cart]);
  const subtotal = useMemo(() => activeCart.reduce((sum, item) => sum + item.cupcake.price * item.quantity, 0), [activeCart]);
  
  const discountAmount = useMemo(() => subtotal * discount, [subtotal, discount]);
  const totalPrice = useMemo(() => subtotal - discountAmount + DELIVERY_FEE, [subtotal, discountAmount]);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'PROMO10') {
      setDiscount(0.10);
      setCouponError('');
    } else {
      setDiscount(0);
      setCouponError('Cupom de desconto inválido.');
    }
  };
  
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
        const onlyNums = value.replace(/\D/g, '');
        let masked = onlyNums
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d{5})(\d)/g, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
        setCustomer(prev => ({ ...prev, [name]: masked }));
    } else {
        setCustomer(prev => ({ ...prev, [name]: value }));
    }
    if (customerError) setCustomerError('');
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (addressError) setAddressError('');
  };
  
  const handleSelectPayment = (method: string) => {
    setPaymentMethod(method);
    if(paymentError) setPaymentError('');
    if(paymentDetailsError) setPaymentDetailsError('');
    setNeedsChange(null);
    setChangeForAmount('');
  }

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
        formattedValue = value.replace(/\D/g, '').substring(0, 16);
        formattedValue = formattedValue.replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiry') {
        formattedValue = value.replace(/\D/g, '').substring(0, 4);
        if (formattedValue.length > 2) {
            formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
        }
    } else if (name === 'cvv') {
        formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    if (paymentDetailsError) setPaymentDetailsError('');
  };

  const handleCopyPix = () => {
    const pixKey = 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8';
    navigator.clipboard.writeText(pixKey).then(() => {
        setIsPixCopied(true);
        setTimeout(() => setIsPixCopied(false), 2000);
    });
  };

  const handleFinalize = () => {
    if (!customer.name || !customer.email || !customer.email.includes('@') || !customer.phone) {
        setCustomerError('Por favor, preencha seu nome, e-mail e telefone válidos.');
        setIsCustomerOpen(true);
        return;
    }
    
    const { street, number, city, state, zip } = address;
    if (!street || !number || !city || !state || !zip) {
        setAddressError('Por favor, preencha todos os campos do endereço.');
        setIsAddressOpen(true);
        return;
    }
    if (!paymentMethod) {
        setPaymentError('Por favor, selecione uma forma de pagamento.');
        setIsPaymentOpen(true);
        return;
    }
    
    if (paymentMethod === 'Cartão de Crédito') {
        const { number, name, expiry, cvv } = cardDetails;
        const expiryParts = expiry.split('/');
        const expiryMonth = parseInt(expiryParts[0], 10);
        const expiryYear = parseInt(expiryParts[1], 10);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (!number || !name || !expiry || !cvv) {
            setPaymentDetailsError('Preencha todos os dados do cartão.');
            return;
        }
        if (number.replace(/\s/g, '').length !== 16) {
            setPaymentDetailsError('Número do cartão inválido.');
            return;
        }
        if (!expiry.match(/^\d{2}\/\d{2}$/) || expiryMonth < 1 || expiryMonth > 12 || expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
            setPaymentDetailsError('Data de validade inválida.');
            return;
        }
        if (cvv.length < 3 || cvv.length > 4) {
             setPaymentDetailsError('CVV inválido.');
             return;
        }
    }
    
    if (paymentMethod === 'Dinheiro na Entrega') {
        if (needsChange === null) {
            setPaymentDetailsError('Por favor, informe se precisa de troco.');
            setIsPaymentOpen(true);
            return;
        }
        if (needsChange === 'yes') {
            const amount = parseFloat(changeForAmount);
            if (!changeForAmount || isNaN(amount) || amount <= 0) {
                setPaymentDetailsError('Por favor, informe um valor válido para o troco.');
                setIsPaymentOpen(true);
                return;
            }
            if (amount <= totalPrice) {
                setPaymentDetailsError('O valor para troco deve ser maior que o total do pedido.');
                setIsPaymentOpen(true);
                return;
            }
        }
    }

    setPaymentDetailsError('');
    
    const changeDetailsPayload = paymentMethod === 'Dinheiro na Entrega' ? {
        needsChange: needsChange === 'yes',
        forAmount: needsChange === 'yes' ? parseFloat(changeForAmount) : undefined,
    } : undefined;

    onFinalizeOrder({ items: activeCart, total: totalPrice, paymentMethod, customer, address, changeDetails: changeDetailsPayload });
  };

  const renderPaymentDetails = () => {
    switch (paymentMethod) {
      case 'Cartão de Crédito':
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center space-x-2 mb-2">
                <CreditCardIcon className="h-6 w-6 text-slate-600" />
                <h3 className="text-md font-semibold text-slate-700">Dados do Cartão</h3>
            </div>
            <FormInput label="Nome no Cartão" name="name" value={cardDetails.name} onChange={handleCardDetailsChange} placeholder="Ex: Maria S. Silva" />
            <FormInput label="Número do Cartão" name="number" value={cardDetails.number} onChange={handleCardDetailsChange} placeholder="0000 0000 0000 0000" />
            <div className="flex space-x-3">
              <FormInput label="Validade (MM/AA)" name="expiry" value={cardDetails.expiry} onChange={handleCardDetailsChange} placeholder="MM/AA" className="w-1/2" />
              <FormInput label="CVV" name="cvv" value={cardDetails.cvv} onChange={handleCardDetailsChange} placeholder="123" className="w-1/2" type="tel" maxLength={4} />
            </div>
            {paymentDetailsError && <p className="text-red-500 text-sm">{paymentDetailsError}</p>}
          </div>
        );
      case 'Pix':
        return (
            <div className="text-center flex flex-col items-center space-y-4 animate-fade-in p-2 bg-slate-50 rounded-lg shadow-sm">
                <h3 className="font-semibold text-slate-700">Pague com Pix</h3>
                <div className="bg-white p-2 border border-slate-200 rounded-lg shadow-inner">
                   <img src="https://generator.qrcodefacil.com/qrcodes/static-493645d40f9d028c06f4c36f9de55909.svg" alt="QR Code Pix" className="w-36 h-36" />
                </div>
                <p className="text-sm text-slate-600 max-w-xs">Use o app do seu banco para ler o QR Code ou copie o código abaixo.</p>
                <div className="w-full p-2 bg-slate-200 rounded-lg text-xs text-slate-700 font-mono break-all">
                   a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8
                </div>
                <button 
                    onClick={handleCopyPix}
                    className="w-full flex items-center justify-center space-x-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    <CopyIcon className="h-5 w-5" />
                    <span>{isPixCopied ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
             </div>
        );
      case 'Dinheiro na Entrega':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center space-x-2">
                <CashIcon className="h-6 w-6 text-slate-600" />
                <h3 className="text-md font-semibold text-slate-700">Pagamento na Entrega</h3>
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Precisa de troco?</p>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => {
                            setNeedsChange('no');
                            setChangeForAmount('');
                            if (paymentDetailsError) setPaymentDetailsError('');
                        }}
                        className={`flex-1 font-bold py-2 px-4 rounded-lg border-2 transition-colors ${
                            needsChange === 'no' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                    >Não</button>
                    <button
                        onClick={() => {
                            setNeedsChange('yes');
                             if (paymentDetailsError) setPaymentDetailsError('');
                        }}
                        className={`flex-1 font-bold py-2 px-4 rounded-lg border-2 transition-colors ${
                            needsChange === 'yes' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                    >Sim</button>
                </div>
            </div>
            {needsChange === 'yes' && (
                <div className="animate-fade-in">
                    <FormInput
                        label="Troco para quanto?"
                        name="changeFor"
                        type="number"
                        value={changeForAmount}
                        onChange={(e) => setChangeForAmount(e.target.value)}
                        placeholder="Ex: 50.00"
                    />
                </div>
            )}
             {paymentDetailsError && <p className="text-red-500 text-sm mt-2">{paymentDetailsError}</p>}
          </div>
        );
      default:
        return null;
    }
  };


  if (activeCart.length === 0) {
    return (
        <div className="bg-slate-100 h-full flex flex-col">
            <Header title="PEDIDO" onBack={() => setScreen(Screen.Flavors)} />
            <div className="flex-grow flex flex-col justify-center items-center text-center p-6">
                <p className="text-lg text-slate-500 mb-4">Seu carrinho está vazio.</p>
                <button 
                    onClick={() => setScreen(Screen.Flavors)}
                    className="bg-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors shadow-lg"
                >
                    Ver Sabores
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-slate-100 h-full flex flex-col">
      <Header title="PEDIDO" onBack={() => setScreen(Screen.Flavors)} />
      <div className="p-6 space-y-4 flex-grow overflow-y-auto">
        {activeCart.map(item => (
          <div key={item.cupcake.id} className="flex items-center bg-white p-3 rounded-lg shadow-md">
            <img src={item.cupcake.image} alt={item.cupcake.name} className="w-12 h-12 rounded-md object-cover" />
            <div className="ml-4 flex-grow">
              <p className="font-semibold text-slate-700">{item.quantity}x {item.cupcake.name}</p>
            </div>
            <p className="font-bold text-slate-800">R$ {(item.quantity * item.cupcake.price).toFixed(2)}</p>
          </div>
        ))}
        
        <div className="bg-white p-4 rounded-lg shadow-md space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-md text-slate-600">Subtotal</span>
                <span className="text-md text-slate-700">R$ {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
                 <div className="flex justify-between items-center text-green-600">
                    <span className="text-md">Desconto ({(discount * 100).toFixed(0)}%)</span>
                    <span className="text-md font-semibold">- R$ {discountAmount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between items-center">
                <span className="text-md text-slate-600">Taxa de Entrega</span>
                <span className="text-md text-slate-700">R$ {DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t mt-2">
                <span className="text-lg font-bold text-slate-700">TOTAL</span>
                <span className="text-xl font-bold text-pink-500">R$ {totalPrice.toFixed(2)}</span>
            </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
            <button 
                onClick={() => setIsCustomerOpen(!isCustomerOpen)}
                className="w-full flex justify-between items-center text-left"
                aria-expanded={isCustomerOpen}
            >
                <span className="font-semibold text-slate-700">DADOS DO CLIENTE</span>
                 <div className="flex items-center space-x-2">
                    {Object.values(customer).every(field => field) && !isCustomerOpen && (
                        <CheckboxIcon className="h-6 w-6 text-green-500" />
                    )}
                    <ChevronDownIcon className={`h-6 w-6 text-slate-500 transition-transform duration-300 ${isCustomerOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCustomerOpen ? 'max-h-[500px] mt-4' : 'max-h-0'}`}>
                <div className="space-y-3 pt-4 border-t">
                    <FormInput label="Nome Completo" name="name" value={customer.name} onChange={handleCustomerChange} placeholder="Ex: Maria da Silva" />
                    <FormInput label="E-mail" name="email" value={customer.email} onChange={handleCustomerChange} placeholder="Ex: maria@email.com" type="email" />
                    <FormInput label="Telefone de Contato" name="phone" value={customer.phone} onChange={handleCustomerChange} placeholder="(11) 98765-4321" type="tel" maxLength={15} />
                    {customerError && <p className="text-red-500 text-sm mt-2">{customerError}</p>}
                </div>
            </div>
        </div>


        <div className="bg-white p-4 rounded-lg shadow-md">
            <button 
                onClick={() => setIsAddressOpen(!isAddressOpen)}
                className="w-full flex justify-between items-center text-left"
                aria-expanded={isAddressOpen}
            >
                <span className="font-semibold text-slate-700">ENDEREÇO DE ENTREGA</span>
                <div className="flex items-center space-x-2">
                    {Object.values(address).every(field => field) && !isAddressOpen && (
                        <CheckboxIcon className="h-6 w-6 text-green-500" />
                    )}
                    <ChevronDownIcon className={`h-6 w-6 text-slate-500 transition-transform duration-300 ${isAddressOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isAddressOpen ? 'max-h-[500px] mt-4' : 'max-h-0'}`}>
                <div className="space-y-3 pt-4 border-t">
                    <FormInput label="Rua" name="street" value={address.street} onChange={handleAddressChange} placeholder="Ex: Rua das Flores" />
                    <div className="flex space-x-3">
                        <FormInput label="Número" name="number" value={address.number} onChange={handleAddressChange} placeholder="123" className="w-1/3" />
                        <FormInput label="CEP" name="zip" value={address.zip} onChange={handleAddressChange} placeholder="12345-678" className="w-2/3" />
                    </div>
                    <FormInput label="Cidade" name="city" value={address.city} onChange={handleAddressChange} placeholder="São Paulo" />
                    <FormInput label="Estado" name="state" value={address.state} onChange={handleAddressChange} placeholder="SP" />
                    {addressError && <p className="text-red-500 text-sm mt-2">{addressError}</p>}
                </div>
            </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
            <button 
                onClick={() => setIsPaymentOpen(!isPaymentOpen)}
                className="w-full flex justify-between items-center text-left"
                aria-expanded={isPaymentOpen}
            >
                <span className="font-semibold text-slate-700">FORMA DE PAGAMENTO</span>
                 <div className="flex items-center space-x-2">
                    {paymentMethod && !isPaymentOpen && (
                        <CheckboxIcon className="h-6 w-6 text-green-500" />
                    )}
                    <ChevronDownIcon className={`h-6 w-6 text-slate-500 transition-transform duration-300 ${isPaymentOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isPaymentOpen ? 'max-h-[600px] mt-4' : 'max-h-0'}`}>
                <div className="space-y-3 pt-4 border-t">
                    <PaymentOption 
                        label="Cartão de Crédito" 
                        icon={<CreditCardIcon />} 
                        isSelected={paymentMethod === 'Cartão de Crédito'} 
                        onClick={() => handleSelectPayment('Cartão de Crédito')} 
                    />
                    <PaymentOption 
                        label="Pix" 
                        icon={<PixIcon />} 
                        isSelected={paymentMethod === 'Pix'} 
                        onClick={() => handleSelectPayment('Pix')} 
                    />
                     <PaymentOption 
                        label="Dinheiro na Entrega" 
                        icon={<CashIcon />} 
                        isSelected={paymentMethod === 'Dinheiro na Entrega'} 
                        onClick={() => handleSelectPayment('Dinheiro na Entrega')} 
                    />
                    
                    {paymentMethod && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                          {renderPaymentDetails()}
                      </div>
                    )}

                    {paymentError && <p className="text-red-500 text-sm mt-2">{paymentError}</p>}
                </div>
            </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
            <label className="text-sm font-semibold text-slate-500 px-1">CUPOM DE DESCONTO</label>
            <div className="flex items-center space-x-2 mt-1">
                <input 
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      if (couponError) setCouponError('');
                      if (discount > 0) setDiscount(0);
                    }}
                    placeholder="Ex: PROMO10"
                    className={`w-full p-3 bg-black text-white border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition placeholder:text-slate-400 ${couponError ? 'border-red-500 ring-red-300' : 'border-slate-600'}`}
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-slate-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0"
                >
                  Aplicar
                </button>
            </div>
            {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
            {discount > 0 && <p className="text-green-600 text-sm mt-2">Cupom de {(discount * 100).toFixed(0)}% aplicado com sucesso!</p>}
        </div>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowCancelConfirm(true)}
          className="w-full bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-slate-400 transition-colors"
        >
          CANCELAR
        </button>
        <button 
          onClick={handleFinalize}
          className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors shadow-lg"
        >
          FINALIZAR PEDIDO
        </button>
      </div>
      
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Confirmar Cancelamento</h3>
                <p className="text-slate-600 mb-6">Tem certeza que deseja cancelar este pedido?</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-400 transition-colors"
                    >
                        Não
                    </button>
                    <button
                        onClick={() => {
                            setScreen(Screen.Flavors);
                            setShowCancelConfirm(false);
                        }}
                        className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Sim
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default OrderScreen;