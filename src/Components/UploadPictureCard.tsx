import { CSSProperties, FC, useEffect, useState } from 'react';
import { Upload, Modal } from 'antd';
import type { UploadFile, UploadProps, GetProp } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface Props {
    style?: CSSProperties,
    change?: (images: UploadFile[]) => void,
    value?: UploadFile[]
}

const toBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });

export const UploadPictureCard: FC<Props> = ({ style, change, value }) => {
    const [fileList, setFileList] = useState<UploadFile[]>(value || []);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const dummyRequest = ({ onSuccess }: any) => {
        setTimeout(() => onSuccess('ok'), 0);
    };

    const handleChange: UploadProps['onChange'] = async ({ fileList: newList }) => {
        // Generar url de preview inmediatamente desde originFileObj
        // para no depender del thumbUrl async de antd
        const enriched = await Promise.all(
            newList.map(async (f) => {
                if (f.url || f.thumbUrl) return f;
                if (f.originFileObj) {
                    try {
                        const url = await toBase64(f.originFileObj as FileType);
                        return { ...f, url };
                    } catch { return f; }
                }
                return f;
            })
        );
        setFileList(enriched);
        change?.(enriched);
    };

    const handlePreview = async (file: UploadFile) => {
        const src = file.url || file.thumbUrl || '';
        setPreviewImage(src);
        setPreviewOpen(true);
    };

    useEffect(() => {
        if (value) setFileList(value.map(f => ({ ...f })));
    }, [value]);

    // Tamaño final del botón/card de upload
    const size = {
        width: (style?.width ?? 70) as number,
        height: (style?.height ?? 70) as number,
    };

    return (
        <>
            <ImgCrop rotationSlider aspect={1} quality={1}>
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    customRequest={dummyRequest}
                    onChange={handleChange}
                    accept="image/*"
                    maxCount={1}
                    // Aplicar tamaño via className en el CSS global
                    className="upload-picture-fixed"
                    style={{ width: size.width, height: size.height }}
                >
                    {fileList.length >= 1 ? null : (
                        <div style={{ color: 'gray', lineHeight: 1 }}>
                            <PlusOutlined />
                            <div style={{ marginTop: 6, fontSize: 11 }}>Subir</div>
                        </div>
                    )}
                </Upload>
            </ImgCrop>

            <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};


// ─── UploaderPicture (16:9, usado en Branch) ─────────────────────────────────

export const UploaderPicture: FC<Props> = ({ change, value }) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const dummyRequest = ({ onSuccess }: any) => {
        setTimeout(() => onSuccess('ok'), 0);
    };

    const onChange: UploadProps['onChange'] = async ({ fileList: newList }) => {
        const enriched = await Promise.all(
            newList.map(async (f) => {
                if (f.url || f.thumbUrl) return f;
                if (f.originFileObj) {
                    try {
                        const url = await toBase64(f.originFileObj as FileType);
                        return { ...f, url };
                    } catch { return f; }
                }
                return f;
            })
        );
        setFileList(enriched);
        change?.(enriched);
    };

    const onPreview = async (file: UploadFile) => {
        setPreviewTitle(file.name || file.fileName || '');
        setPreviewImage(file.url || file.thumbUrl || '');
        setPreviewOpen(true);
    };

    useEffect(() => {
        if (value) setFileList(value);
    }, [value]);

    return (
        <>
            <ImgCrop aspect={16 / 9}>
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={onChange}
                    onPreview={onPreview}
                    customRequest={dummyRequest}
                    accept="image/*"
                    maxCount={1}
                >
                    {fileList.length >= 1 ? null : (
                        <div style={{ color: 'gray' }}>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Subir</div>
                        </div>
                    )}
                </Upload>
            </ImgCrop>

            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};
