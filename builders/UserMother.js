import { User } from '../src/domain/User.js';

export class UserMother {

    static umUsuarioPadrao() {

        return new User(
            1,
            'Usuário Comum',
            'comum@email.com',
            'PADRAO'
        );
    }

    static umUsuarioPremium() {

        return new User(
            2,
            'Usuário Premium',
            'premium@email.com',
            'PREMIUM'
        );
    }
}