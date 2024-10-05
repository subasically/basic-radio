import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        green: {
          50: "#EFFDF5",
          100: "#D9FBE8",
          200: "#B3F5D1",
          300: "#75EDAE",
          400: "#00DC82",
          500: "#00C16A",
          600: "#00A155",
          700: "#007F45",
          800: "#016538",
          900: "#0A5331",
          950: "#052e16",
        },
        tomato: {
          50: "#fff3f1",
          100: "#ffe4df",
          200: "#ffcec5",
          300: "#ffac9d",
          400: "#ff7c64",
          500: "#ff6347",
          600: "#ed3615",
          700: "#c8290d",
          800: "#a5260f",
          900: "#882614",
          950: "#4b0f04",
        },
      },
    },
  },
};
