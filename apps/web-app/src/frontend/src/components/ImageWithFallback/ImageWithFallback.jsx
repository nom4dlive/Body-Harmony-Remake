import React, { useState } from 'react';

export default function ImageWithFallback({ src, fallbackSrc, alt, ...props }) {
    const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
    const [hasError, setHasError] = useState(false);

    // Sync state if src prop changes
    React.useEffect(() => {
        setImgSrc(src || fallbackSrc);
        setHasError(false);
    }, [src, fallbackSrc]);

    return (
        <img
            {...props}
            src={imgSrc}
            alt={alt}
            onError={() => {
                if (!hasError) {
                    setHasError(true);
                    setImgSrc(fallbackSrc);
                }
            }}
        />
    );
}
