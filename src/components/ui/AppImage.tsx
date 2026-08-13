'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import Image from 'next/image';

interface AppImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    fill?: boolean;
    sizes?: string;
    onClick?: () => void;
    fallbackSrc?: string;
    loading?: 'lazy' | 'eager';
    unoptimized?: boolean;
    [key: string]: any;
}

const AppImage = memo(function AppImage({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    quality = 75,
    placeholder = 'empty',
    blurDataURL,
    fill = false,
    sizes,
    onClick,
    fallbackSrc,
    loading = 'lazy',
    unoptimized = false,
    ...props
}: AppImageProps) {
    const [isError, setIsError] = useState(false);

    const handleError = useCallback(() => {
        setIsError(true);
    }, []);

    const imageSrc = useMemo(() => {
        return isError && fallbackSrc ? fallbackSrc : src;
    }, [isError, fallbackSrc, src]);

    return (
        <Image
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            priority={priority}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            fill={fill}
            sizes={sizes}
            loading={loading}
            unoptimized={unoptimized}
            onClick={onClick}
            onError={handleError}
            {...props}
        />
    );
});

export default AppImage;
