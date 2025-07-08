import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M12 2.16L4.22 8.35l-1.9 8.29L12 21.84l9.68-5.2-1.9-8.29L12 2.16zm0 1.54l6.5 5.25-1.4 6.1H6.9l-1.4-6.1L12 3.7z" />
        <path d="M12 10.5l-5.66 2.89L7.5 18.5h9l1.16-5.11L12 10.5z" />
    </svg>
);
