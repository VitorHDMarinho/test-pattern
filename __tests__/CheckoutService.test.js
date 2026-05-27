import { CheckoutService } from '../src/services/CheckoutService.js';

import { CarrinhoBuilder } from '../builders/CarrinhoBuilder.js';
import { UserMother } from '../builders/UserMother.js';

import { Item } from '../src/domain/Item.js';

describe('CheckoutService', () => {

    describe('quando o pagamento falha', () => {

        test('deve retornar null', async () => {

            // ARRANGE

            const carrinho = new CarrinhoBuilder()
                .build();

            // STUB
            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({
                    success: false
                })
            };

            // DUMMIES
            const repositoryDummy = {};
            const emailDummy = {};

            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryDummy,
                emailDummy
            );

            // ACT

            const pedido = await checkoutService.processarPedido(
                carrinho,
                '1111-2222-3333'
            );

            // ASSERT

            expect(pedido).toBeNull();

            expect(gatewayStub.cobrar).toHaveBeenCalledTimes(1);
        });
    });

    describe('quando um cliente Premium finaliza a compra', () => {

        test('deve aplicar desconto e enviar email', async () => {

            // ARRANGE

            const usuarioPremium =
                UserMother.umUsuarioPremium();

            const itens = [
                new Item('Notebook', 100),
                new Item('Mouse', 100)
            ];

            const carrinho = new CarrinhoBuilder()
                .comUser(usuarioPremium)
                .comItens(itens)
                .build();

            // STUB
            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({
                    success: true
                })
            };

            // STUB
            const repositoryStub = {
                salvar: jest.fn().mockImplementation((pedido) => {

                    pedido.id = 1;

                    return Promise.resolve(pedido);
                })
            };

            // MOCK
            const emailMock = {
                enviarEmail: jest.fn().mockResolvedValue(true)
            };

            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryStub,
                emailMock
            );

            // ACT

            const pedido = await checkoutService.processarPedido(
                carrinho,
                '9999-8888-7777'
            );

            // ASSERT

            expect(pedido).not.toBeNull();

            // 200 -> desconto 10% = 180
            expect(gatewayStub.cobrar)
                .toHaveBeenCalledWith(
                    180,
                    '9999-8888-7777'
                );

            expect(emailMock.enviarEmail)
                .toHaveBeenCalledTimes(1);

            expect(emailMock.enviarEmail)
                .toHaveBeenCalledWith(
                    'premium@email.com',
                    'Seu Pedido foi Aprovado!',
                    expect.stringContaining('180')
                );
        });
    });
});