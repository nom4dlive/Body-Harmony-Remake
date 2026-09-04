import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToHashElement = () => {
    const location = useLocation();

    useEffect(() => {
        const hash = location.hash;
        const removeHashCharacter = (str) => {
            const result = str.slice(1);
            return result;
        };

        if (hash) {
            const element = document.getElementById(removeHashCharacter(hash));
            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "nearest",
                });
            }
        }
    }, [location]);

    return null;
};

export default ScrollToHashElement;
