module.exports = {
    purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    darkMode: 'class', // or 'media' or 'class'
    theme: {
        extend: {},
        fontFamily: {
            roboto: ['"Roboto"'],
            poppins: ['"Poppins"'],
            title: ['"Fredoka One"'],
        },
    },
    variants: {
        extend: {
            borderWidth: ["hover", "focus"],
            fontFamily: ["hover", "focus"],
            fontWeight: ["hover", "focus", "group-hover"],
            scale: ['active', 'group-hover'],
            display: ["group-hover"],
            padding: ['first', 'last']
        },
    },
    plugins: [
        require('tailwindcss-nested-groups')
    ],
};
