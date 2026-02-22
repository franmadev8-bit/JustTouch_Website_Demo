import { useAccountContext } from "@/Context/AccountContext";
import { useAccount } from "@/Hooks/AccountHook";
import { Button, Flex, Input, Modal } from "antd";
import { FC } from "react";

export const ModalSocial: FC = () => {
    const { handleBranch } = useAccount();
    const { account, selectedFranchise, selectedBranch, socialModal, closeModal } = useAccountContext();

    const branch = selectedFranchise !== undefined && selectedBranch !== undefined ?
        account.franchises[selectedFranchise].branches[selectedBranch] :
        null;

    return (
        <Modal title="Contactos" footer={null} closable={false} open={socialModal}>
            <Flex vertical gap={10}>
                <Input placeholder="Perfil de Instagram..."
                    onChange={e => handleBranch('instagramUrl', e.target.value, selectedFranchise!, selectedBranch!)}
                    value={branch != null ? branch!.instagramUrl : ''}
                />
                <Input placeholder="Pagina de Facebook..."
                    onChange={e => handleBranch('facebookUrl', e.target.value, selectedFranchise!, selectedBranch!)}
                    value={branch != null ? branch!.facebookUrl : ''}
                />
                <Input placeholder="Link de WhatsApp..."
                    onChange={e => handleBranch('whatsappUrl', e.target.value, selectedFranchise!, selectedBranch!)}
                    value={branch != null ? branch!.whatsappUrl : ''}
                />
                <Button color="cyan" variant="solid" onClick={() => closeModal('social')}>Hecho</Button>
            </Flex>
        </Modal>
    )
}