import { useApp } from "@/Hooks/AppHook";
import { Button, Space } from "antd";
import { FC } from "react";
import { FaArrowLeftLong, FaRegFloppyDisk } from "react-icons/fa6";


interface Props {
    Save?: () => void,
    Back?: () => void,
}

export const HeadActions: FC<Props> = ({ Save, Back }) => {
    const { isLarge, isMed } = useApp();
    const sizeButton = isLarge ? "large" : isMed ? "middle" : "small";

    return (
        <Space className="actions">
            <Button className="btn-back"
                size={sizeButton}
                icon={<FaArrowLeftLong />}
                variant="outlined"
                onClick={Back}>Volver</Button>
            <Button className="btn-save"
                size={sizeButton}
                icon={<FaRegFloppyDisk />}
                color="primary"
                onClick={Save}
                variant="solid">Guardar</Button>
        </Space>
    )
}