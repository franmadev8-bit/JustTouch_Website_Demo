import { UploaderFile } from "@/Components/UploaderFile";
import { useAccountContext } from "@/Context/AccountContext";
import { useAccount } from "@/Hooks/AccountHook";
import { Button, Col, Modal, Row } from "antd";
import { FC } from "react";

export const PictureModal: FC = () => {
    const { selectedFranchise, selectedBranch, account, pictureModal, closeModal } = useAccountContext();
    const { handleBranch } = useAccount();

    const branch = selectedFranchise !== undefined && selectedBranch !== undefined ?
        account.franchises[selectedFranchise].branches[selectedBranch] :
        null;

    const handleCover = (file: File | undefined) => {
        if (!file) {
            handleBranch('coverUrl', file, selectedFranchise!, selectedBranch!);
            handleBranch('coverFile', file, selectedFranchise!, selectedBranch!);
            return;
        }
        handleBranch('coverUrl', URL.createObjectURL(file), selectedFranchise!, selectedBranch!);
        handleBranch('coverFile', file, selectedFranchise!, selectedBranch!);
    }

    const handlePicture = (file: File | undefined) => {
        if (!file) {
            handleBranch('pictureUrl', file, selectedFranchise!, selectedBranch!);
            handleBranch('pictureFile', file, selectedFranchise!, selectedBranch!);
            return;
        }
        handleBranch('pictureUrl', URL.createObjectURL(file), selectedFranchise!, selectedBranch!);
        handleBranch('pictureFile', file, selectedFranchise!, selectedBranch!);
    }

    return (
        <Modal title="Portadas" open={pictureModal} closable={false} footer={null}>
            <Row style={{ gap: 15 }}>
                <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                    <UploaderFile
                        className="cover-file"
                        src={branch != null ? branch.coverUrl : undefined}
                        change={handleCover} />
                </Col>
                <Col xl={6} lg={6} md={6} sm={6} xs={6}>
                    <UploaderFile
                        className="picture-file"
                        src={branch != null ? branch.pictureUrl : undefined}
                        change={handlePicture} />
                </Col>
                <Col xl={15} lg={15} md={15} sm={15} xs={15}>
                    <p style={{ color: 'gray' }}>Seleccione y cargue las fotos de portada para el menu de esta sucurcal</p>
                </Col>
                <Col xxl={24} xl={24} lg={24} md={24} xs={24}>
                    <Button
                        style={{ width: '100%' }}
                        onClick={() => {
                            closeModal('picture')
                        }} color="cyan" variant="solid">Hecho</Button>
                </Col>
            </Row>
        </Modal>
    )
}