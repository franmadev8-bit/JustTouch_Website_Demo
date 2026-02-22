import { Button, Card, Flex, Image, Input, InputRef, Modal } from "antd";
import { FC, useEffect, useRef, useState } from "react";
import { FaEye, FaTrashCan, FaUpload } from "react-icons/fa6";

interface Props {
    src?: string;
    change?: (e?: File) => void;
    className?: string;
}

export const UploaderFile: FC<Props> = ({ className, src, change }) => {
    const ref = useRef<InputRef>(null);
    const [preview, setPreview] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [openPreview, setOpenPreview] = useState<boolean>(false);

    const pickFIle = () => {
        var input = ref.current?.input;
        input?.click();
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const url = URL.createObjectURL(file);
        setPreview(url);
        (change != null || change != undefined) ? change(file) : null;
    };

    const remove = () => {
        setFileName('');
        setPreview('');
        (change != null || change != undefined) ? change(undefined) : null;
    }

    useEffect(() => {
        if (!src) {
            setPreview('');
            setFileName('');
            return;
        }

        setPreview(src);
        setFileName(src.split('/').pop() ?? '');
    }, [src])

    return (
        <>
            <Card onClick={pickFIle}
                className={className}
                style={{
                    color: 'gray',
                    position: 'relative',
                    objectFit: 'cover',
                    backgroundPosition: 'top',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundImage: `url(${preview})`,
                    border: '1px solid lightgray',
                }}>
                {
                    preview == '' ?
                        <Flex vertical align="center" justify="center">
                            <Input ref={ref} accept="image/*" onChange={handleChange} type={'file'} style={{ display: 'none' }} />
                            <FaUpload />
                            <p style={{ margin: 0 }}>Subir</p>
                        </Flex>
                        :
                        <Flex gap={0} style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                        }}>
                            <Button style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: 'gray'
                            }} icon={<FaTrashCan />} onClick={remove} />
                            <Button style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: 'gray'
                            }} icon={<FaEye />} onClick={() => setOpenPreview(true)} />
                        </Flex>
                }
            </Card>
            <Modal title={fileName}
                open={openPreview}
                footer={null}
                onCancel={() => setOpenPreview(false)}>
                <Image src={preview} />
            </Modal >
        </>
    )
}