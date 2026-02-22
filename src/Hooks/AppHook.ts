import { useState } from 'react'
import { Grid } from 'antd';

export const useApp = () => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();

    const changeCollaped = () => setCollapsed(!collapsed);

    const isLarge = screens.xxl || screens.xl || screens.lg;

    const isMed = screens.md || screens.sm;

    const isSmall = screens.xs;

    return {
        collapsed,
        changeCollaped,
        isLarge,
        isMed,
        isSmall
    }
}