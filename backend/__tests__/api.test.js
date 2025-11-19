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

describe('1. Verificação de Saúde', () => {
    it('Deve retornar 200 na rota raiz', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
    });
});

describe('2. Segurança e Erros', () => {
    it('Deve bloquear acesso sem token (401)', async () => {
        // Tenta acessar rotas protegidas sem o header Authorization
        const res = await request(app).get('/api/orders');
        expect(res.statusCode).toEqual(401);
    });
});

describe('3. Fluxo Completo do Restaurante', () => {
    let token;
    let orderId;
    
    // Usuário de teste único para esta rodada
    const testUser = {
        name: 'Tester Automatizado',
        email: `test_full_${Date.now()}@bq.com`, 
        password: '123',
        role: 'hall'
    };

    it('PASSO A: Registrar e Logar', async () => {
        // 1. Registrar
        await request(app).post('/api/auth/register').send(testUser);
        
        // 2. Login
        const res = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });

        expect(res.statusCode).toEqual(200);
        token = res.body.token; // Guarda o token para os próximos passos
    });

    it('PASSO B: Listar itens do cardápio', async () => {
        const res = await request(app)
            .get('/api/itens')
            .set('Authorization', `Bearer ${token}`); 

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('PASSO C: Criar um pedido', async () => {
        const newOrder = {
            clientName: "Cliente Jest",
            items: [
                { productId: "123", name: "Burger Teste", price: 20, quantity: 1 }
            ],
            totalPrice: 20
        };

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send(newOrder);

        expect(res.statusCode).toEqual(201);
        orderId = res.body._id; // Guarda o ID do pedido para a cozinha usar
    });

    it('PASSO D: Cozinha busca pedidos pendentes', async () => {
        const res = await request(app)
            .get('/api/orders?status=pending')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        const foundOrder = res.body.find(o => o._id === orderId);
        expect(foundOrder).toBeTruthy();
    });

    it('PASSO E: Cozinha marca pedido como Pronto', async () => {
        const res = await request(app)
            .patch(`/api/orders/${orderId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'ready' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('ready');
    });
});