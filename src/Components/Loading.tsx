import { FC } from "react";
import '@/Pages/MainLayout.scss';

export const Loading: FC = () => {
    return (
        <div className="loading-container">
            <div className="loading">
                <span />
                <span />
                <span />
            </div>
        </div>
    )
}