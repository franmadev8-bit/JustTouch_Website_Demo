import { Franchise } from "@/Models/Franchise";
import { User } from "@/Models/User";
import { message } from "antd";

export class Validator {
    private static Instance: Validator;

    public static getInstance() {
        if (!Validator.Instance) {
            Validator.Instance = new Validator();
        }
        return Validator.Instance;
    }

    public franchiseValidator(franchise: Franchise): boolean {
        var valid = Object.entries(franchise).every(([key, value]) => {
            if (key === 'branches') return true;
            return value !== undefined && value !== null && value !== '';
        });
        if (!valid) message.error({ content: 'Complete todos los datos de su negocio para continuar.' })
        return valid
    }

    public AccountValidator(account: User): boolean {
        const userData = Object.entries(account).every(([_, value]) => value !== undefined && value !== null && value !== '');

        if (!userData) {
            message.error('Complete todos los datos de usuario para continuar.');
            return false;
        }

        const passwords = account.password === account.repeat;
        if (!passwords) {
            message.error('Las contraseñas no coinciden.');
            return false;
        }

        const hasFranchise = account.franchises.length > 0;
        if (!hasFranchise) {
            message.error('Debe cargar los datos de su negocio para continuar.');
            return false;
        }

        const hasBranch = account.franchises.every(x => x.branches.length > 0);
        if (!hasBranch) {
            message.error('Debe cargar por lo menos una sucursal por negocio.');
            return false;
        }

        const branchData = account.franchises.every(f =>
            f.branches.every(branch =>
                Object.entries(branch).every(([key, value]) => {
                    const ignoredKeys = [
                        'pictureUrl',
                        'pictureFile',
                        'coverUrl',
                        'coverFile',
                        'instagramUrl',
                        'facebookUrl',
                        'whatsappUrl',
                        'email',
                        'openTime',
                        'closeTime',
                        'branchCode'
                    ];

                    if (ignoredKeys.some(k => key.includes(k))) return true;
                    return value !== undefined && value !== null && value !== '';
                })
            )
        );
        if (!branchData) {
            message.error('Debe completar por lo menos los datos principales de cada sucursal.');
            return false;
        }

        return true
    }
}