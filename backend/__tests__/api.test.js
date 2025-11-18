const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

// Conecta ao banco antes dos testes
beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.DATABASE_URL);
    }
});

// Fecha a conexão após os testes
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Verificação de Saúde da API', () => {
    it('Deve retornar 200 na rota raiz', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
    });
});

describe('Fluxo Completo: Autenticação e Pedidos', () => {
    let token;
    // Criamos um email único para não dar erro de "usuário já existe"
    const testUser = {
        name: 'Garçom Teste Jest',
        email: `teste_jest_${Date.now()}@burgerqueen.com`, 
        password: '123',
        role: 'hall'
    };

    // Teste 1: Criar Usuário e Logar
    it('Deve registrar um novo garçom e fazer login', async () => {
        // 1. Registrar
        const regRes = await request(app).post('/api/auth/register').send(testUser);
        expect(regRes.statusCode).toEqual(201);

        // 2. Login
        const loginRes = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });

        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.body).toHaveProperty('token');
        
        // Armazena o token para o próximo teste
        token = loginRes.body.token;
    });

    // Teste 2: Criar Pedido (requer o token acima)
    it('Deve criar um pedido com o token do garçom', async () => {
        const newOrder = {
            clientName: "Cliente Teste Automatizado",
            items: [
                {
                    productId: "id_falso_123", // Como é string, pode ser qualquer coisa
                    name: "Hambúrguer Teste",
                    price: 20,
                    quantity: 2
                }
            ],
            totalPrice: 40
        };

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`) // <--- Usa o token aqui
            .send(newOrder);

        expect(res.statusCode).toEqual(201);
        expect(res.body.clientName).toEqual(newOrder.clientName);
        expect(res.body.status).toEqual('pending');
    });
});