import { useAccountContext } from "@/Context/AccountContext";
import { Validator } from "@/Helpers/Validator";
import { useAccount } from "@/Hooks/AccountHook";
import { TaxCategory } from "@/Models/Enums/TaxCategories";
import { Franchise } from "@/Models/Franchise";
import { Button, Col, Input, Modal, Row, Select } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { FC, useEffect, useState } from "react";

export const FranchiseModal: FC = () => {
    const { franchiseModal, closeModal, account, selectedFranchise } = useAccountContext();
    const { pushFranchise, editFranchise, removeFranchise } = useAccount();
    const [franchise, setFranchise] = useState<Franchise>(new Franchise({ taxCategory: 'SC' }));
    const validator = Validator.getInstance();

    const handlerFranchise = <K extends keyof Franchise>(key: K, value: any) => setFranchise(prev => ({
        ...prev,
        [key]: value
    }))

    const options: DefaultOptionType[] = Array.from(Object.entries(TaxCategory).map((x) => {
        return { label: x[1], value: x[0] }
    }))

    const push = () => {
        var valid = validator.franchiseValidator(franchise);
        if (valid) {
            if (selectedFranchise !== undefined) {
                editFranchise(franchise, selectedFranchise);
                closeModal('franchise');
                return;
            }
            pushFranchise(franchise);
            closeModal('franchise');
        }
    }

    const remove = () => {
        if (selectedFranchise !== undefined) removeFranchise(selectedFranchise)
        closeModal('franchise');
    }


    useEffect(() => {
        selectedFranchise !== undefined ?
            setFranchise(account.franchises[selectedFranchise]) :
            setFranchise(new Franchise({ taxCategory: 'SC' }));
    }, [selectedFranchise]);

    return (
        <Modal title={`${selectedFranchise !== undefined ? 'Editar' : 'Añadir'} Negocio`} onCancel={() => closeModal('franchise')} open={franchiseModal} footer={null}>
            <Row style={{ gap: 10 }}>
                <Col lg={12}>
                    <Input placeholder="Nombre..."
                        onChange={e => handlerFranchise('fantasyName', e.target.value)}
                        value={franchise.fantasyName} />
                </Col>
                <Col lg={11}>
                    <Input placeholder="Razon social"
                        onChange={e => handlerFranchise('companyName', e.target.value)}
                        value={franchise.companyName} />
                </Col>
                <Col lg={12}>
                    <Input placeholder="CUIT..."
                        onChange={e => handlerFranchise('taxId', e.target.value)}
                        value={franchise.taxId} />
                </Col>
                <Col lg={11}>
                    <Select style={{ width: '100%' }} placeholder='Categoria fiscal...' options={options}
                        onChange={e => handlerFranchise('taxCategory', e)}
                        value={franchise.taxCategory || 'SC'} />
                </Col>
                {selectedFranchise != undefined ?
                    <Col lg={24}>
                        <Row style={{ gap: 10 }}>
                            <Col lg={12}>
                                <Button variant="filled"
                                    color="blue"
                                    style={{ width: '100%' }}
                                    onClick={push}>Editar</Button>
                            </Col>
                            <Col lg={11}>
                                <Button variant="filled"
                                    color="red"
                                    style={{ width: '100%' }}
                                    onClick={remove}>Quitar</Button>
                            </Col>
                        </Row>
                    </Col>
                    :
                    <Col lg={24}>
                        <Button variant="filled"
                            color="blue"
                            style={{ width: '100%' }}
                            onClick={push}>Agregar</Button>
                    </Col>
                }
            </Row>
        </Modal>
    )
}