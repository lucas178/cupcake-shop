
import { Cupcake } from './types';

export const CUPCAKE_FLAVORS: Cupcake[] = [
  {
    id: 1,
    name: 'Cupcake Chocolate',
    price: 8.50,
    image: 'https://picsum.photos/id/25/200/200',
    weight: 100,
    ingredients: ['Farinha de Trigo', 'Açúcar', 'Chocolate em Pó 50%', 'Ovos', 'Leite', 'Óleo Vegetal', 'Gotas de Chocolate'],
    reviews: [
      { user: 'Ana P.', rating: 5, comment: 'Simplesmente o melhor cupcake de chocolate que já comi! Molhadinho e com muito recheio.' },
      { user: 'Carlos S.', rating: 4, comment: 'Muito bom, mas poderia ter um pouco mais de gotas de chocolate.' },
    ]
  },
  {
    id: 2,
    name: 'Cupcake Nutella',
    price: 9.00,
    image: 'https://picsum.photos/id/102/200/200',
    weight: 100,
    ingredients: ['Farinha de Trigo', 'Açúcar', 'Ovos', 'Leite', 'Nutella', 'Avelãs Trituradas'],
    reviews: [
        { user: 'Juliana M.', rating: 5, comment: 'Perfeito! O recheio de Nutella é super generoso.' },
        { user: 'Ricardo F.', rating: 5, comment: 'Combinação incrível. A avelã por cima dá um toque especial.' },
    ]
  },
  {
    id: 3,
    name: 'Cupcake Red Velvet',
    price: 9.50,
    image: 'https://picsum.photos/id/326/200/200',
    weight: 100,
    ingredients: ['Farinha de Trigo', 'Açúcar', 'Buttermilk', 'Corante Vermelho', 'Vinagre', 'Cream Cheese Frosting'],
    reviews: [
        { user: 'Fernanda L.', rating: 5, comment: 'Massa super fofinha e a cobertura é divina. Meu favorito!' },
        { user: 'Lucas G.', rating: 4, comment: 'Gostoso, mas um pouco doce demais para o meu paladar.' },
    ]
  },
  {
    id: 4,
    name: 'Cupcake Ninho',
    price: 8.75,
    image: 'https://picsum.photos/id/367/200/200',
    weight: 100,
    ingredients: ['Farinha de Trigo', 'Açúcar', 'Ovos', 'Leite Ninho', 'Leite Condensado', 'Creme de Leite'],
    reviews: [
        { user: 'Beatriz C.', rating: 5, comment: 'Para quem ama Leite Ninho, não tem erro. É maravilhoso!' },
        { user: 'Tiago R.', rating: 5, comment: 'Sabor de infância. Muito bem feito.' },
    ]
  },
   {
    id: 5,
    name: 'Cupcake Limão',
    price: 8.50,
    image: 'https://picsum.photos/id/405/200/200',
    weight: 100,
    ingredients: ['Farinha de Trigo', 'Açúcar', 'Ovos', 'Suco de Limão', 'Raspas de Limão', 'Merengue Suíço'],
    reviews: [
        { user: 'Mariana A.', rating: 5, comment: 'O azedinho do limão com o doce do merengue é perfeito. Adorei!' },
        { user: 'João V.', rating: 4, comment: 'Muito refrescante. A cobertura de merengue é ótima.' },
    ]
  }
];