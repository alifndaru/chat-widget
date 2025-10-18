export interface LayoutConfig {
  themeName: string;
  themeVersion: string;
  demo: string;
  main: {
    type: string;
    primaryColor: string;
    logo: {
      dark: string;
      light: string;
    };
  };
  loader: {
    logo: string;
    display: boolean;
    type: string;
  };
  scrollTop: {
    display: boolean;
  };
  header: {
    display: boolean;
    menuIcon: string;
    width: string;
    fixed: {
      desktop: boolean;
      tabletAndMobile: boolean;
    };
  };
  toolbar: {
    display: boolean;
  };
  aside: {
    display: boolean;
    theme: string;
    fixed: boolean;
    menuIcon: string;
    minimized: boolean;
    minimize: boolean;
    hoverable: boolean;
  };
  content: {
    width: string;
  };
  footer: {
    width: string;
  };
}
