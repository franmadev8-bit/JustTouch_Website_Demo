import { Variants } from "framer-motion";


export const useFramerMotion = () => {
    const fadeLeft: Variants = {
        hidden: { opacity: 0, x: -50 },
        show: (delay = 0) => ({
            opacity: [0, 1, 1],
            x: 0,
            transition: {
                delay,
                duration: .5,
                ease: "easeInOut"
            }
        }),
        exit: { opacity: 0, x: -50 }
    };

    const fadeRight: Variants = {
        hidden: { opacity: 0, x: 50 },
        show: (delay = 0) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay,
                duration: .5,
                ease: "easeInOut"
            }
        }),
        exit: { opacity: 0, x: 50 }
    };

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 50 },
        show: (delay = 0) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: .5,
                delay,
                ease: "easeInOut"
            }
        }),
        exit: { opacity: 0, y: 50 }
    };

    const bounceIn: Variants = {
        hidden: {
            scale: 0.85,
            opacity: 0,
        },
        show: (delay = 0) => ({
            scale: [0.85, 1.1, 0.98, 1],
            opacity: 1,
            transition: {
                duration: .5,
                delay,
                ease: "easeOut",
            },
        }),
        exit: {
            scale: 0,
            opacity: 0,
        }
    };

    return {
        fadeLeft,
        fadeRight,
        fadeUp,
        bounceIn
    }
}

