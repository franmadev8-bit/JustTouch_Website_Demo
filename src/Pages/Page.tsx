import { FC, ReactNode } from "react";
import { Divider, Flex, Typography } from "antd";
import { motion } from 'framer-motion';
import { useFramerMotion } from "@/Hooks/MotionHook";
import { useApp } from "@/Hooks/AppHook";

const { Title } = Typography;

interface Props {
    className?: string,
    HeadTitle: string,
    Actions: ReactNode
    Body: ReactNode,
}

export const Page: FC<Props> = ({ className, HeadTitle, Actions, Body }) => {
    const { fadeUp } = useFramerMotion();
    const { isLarge, isMed, isSmall } = useApp();

    const fontSize = isLarge ? 50 : isMed ? 30 : isSmall ? 17 : 15;
    return (
        <Flex vertical className={`page ${className}`}>
            <motion.div variants={fadeUp} initial="hidden" animate="show" exit="exit">
                <Flex vertical={false} align="center" className="page-header">
                    <Title level={1} style={{ fontSize: fontSize }}>{HeadTitle}</Title>
                    <Flex className="page-actions">{Actions}</Flex>
                </Flex>
                <Divider />
            </motion.div>
            <div className="page-body">
                {Body}
            </div>
        </Flex>
    )
}