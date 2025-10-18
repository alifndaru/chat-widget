import type { LayoutConfig } from "./types";

const config: LayoutConfig = {
  themeName: "BNPB Chat Widget",
  themeVersion: "1.0.0",
  demo: "chat-widget",
  main: {
    type: "default",
    primaryColor: "#009EF7",
    logo: {
      dark: "media/logos/default-dark.svg",
      light: "media/logos/default.svg",
    },
  },
  loader: {
    logo: "media/logos/default-dark.svg",
    display: false,
    type: "default",
  },
  scrollTop: {
    display: false,
  },
  header: {
    display: false,
    menuIcon: "font",
    width: "fluid",
    fixed: {
      desktop: false,
      tabletAndMobile: false,
    },
  },
  toolbar: {
    display: false,
  },
  aside: {
    display: false,
    theme: "dark",
    fixed: false,
    menuIcon: "svg",
    minimized: false,
    minimize: false,
    hoverable: false,
  },
  content: {
    width: "fluid",
  },
  footer: {
    width: "fluid",
  },
};

export default config;
