/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss"), require.resolve("prettier-plugin-organize-imports")],
};

module.exports = config;
