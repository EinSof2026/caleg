'use client';

import React, { memo } from 'react';

interface AppLogoProps {
    size?: number;
    className?: string;
    onClick?: () => void;
}

const AppLogo = memo(function AppLogo({
    size = 32,
    className = '',
    onClick,
}: AppLogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`cursor-pointer transition-transform duration-300 hover:scale-110 ${className}`}
            onClick={onClick}
        >
            {/* Logo Circle Background */}
            <circle cx="20" cy="20" r="19" fill="#D4F5E9" stroke="#2CC177" strokeWidth="1" />
            {/* Logo Mark - S shape for SuaraUtara */}
            <path
                d="M15 12C15 12 12 14 12 18C12 20 13.5 22 15 23C16.5 24 18 24 20 24C22 24 23.5 24 25 23"
                stroke="#2CC177"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M20 26C20 26 18 28 18 30C18 32 19 33 20 33C21 33 22 32 22 30C22 28 20 26 20 26Z"
                fill="#2CC177"
            />
        </svg>
    );
});

AppLogo.displayName = 'AppLogo';

export default AppLogo;