import { User } from "../User";

export interface IAccountContext {
    account: User;
    loadData: () => void;
    SaveChanges: () => void;
    GoBack: () => void;
    handler: (callback: (prev: User) => User) => void;
    pickFranchise: (index: number) => void;
    selectedFranchise: number | undefined;
    selectedBranch: number | undefined;
    openModal: (type: 'franchise' | 'social' | 'picture', findex?: number, bindex?: number) => void;
    closeModal: (type: 'franchise' | 'social' | 'picture') => void;
    franchiseModal: boolean;
    socialModal: boolean;
    pictureModal: boolean;
    accountLoading: boolean;
}