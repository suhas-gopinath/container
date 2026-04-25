declare module "login/Login" {
  export const Login: React.ComponentType;
}

declare module "register/Register" {
  export const Register: React.ComponentType;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
