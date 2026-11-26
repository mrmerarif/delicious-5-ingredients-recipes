import type { Locale } from "@/lib/i18n/config";

export const minPasswordLength = 8;

export type AuthErrorCode =
  | "missingFields"
  | "invalidEmail"
  | "passwordTooShort"
  | "passwordMismatch"
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "emailTaken"
  | "weakPassword"
  | "rateLimited"
  | "unavailable";

export type AuthFormState = {
  error?: AuthErrorCode;
  message?: "checkEmail";
};

export type AuthCopy = {
  loginTitle: string;
  loginIntro: string;
  signupTitle: string;
  signupIntro: string;
  displayName: string;
  optional: string;
  email: string;
  password: string;
  confirmPassword: string;
  passwordHint: string;
  loginButton: string;
  signupButton: string;
  pending: string;
  noAccount: string;
  haveAccount: string;
  goToSignup: string;
  goToLogin: string;
  signOut: string;
  checkEmail: string;
  errors: Record<AuthErrorCode, string>;
};

export const authCopy: Record<Locale, AuthCopy> = {
  en: {
    loginTitle: "Sign in",
    loginIntro: "Welcome back! Sign in to save your recipes and meal plans.",
    signupTitle: "Create account",
    signupIntro: "Create a free account to save your recipes and meal plans.",
    displayName: "Name",
    optional: "optional",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    passwordHint: `At least ${minPasswordLength} characters.`,
    loginButton: "Sign in",
    signupButton: "Create account",
    pending: "Please wait…",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    goToSignup: "Create one",
    goToLogin: "Sign in",
    signOut: "Sign out",
    checkEmail: "Account created! Check your email and click the confirmation link, then sign in.",
    errors: {
      missingFields: "Please fill in all required fields.",
      invalidEmail: "Please enter a valid email address.",
      passwordTooShort: `Password must be ${minPasswordLength} to 72 characters.`,
      passwordMismatch: "Passwords do not match.",
      invalidCredentials: "Email or password is incorrect.",
      emailNotConfirmed: "Please confirm your email first. Check your inbox.",
      emailTaken: "An account with this email already exists.",
      weakPassword: "That password is too weak. Try a longer one.",
      rateLimited: "Too many attempts. Please wait a minute and try again.",
      unavailable: "Sign-in is unavailable right now. Please try again.",
    },
  },
  es: {
    loginTitle: "Iniciar sesión",
    loginIntro: "¡Bienvenido de nuevo! Inicia sesión para guardar tus recetas y planes de comidas.",
    signupTitle: "Crear cuenta",
    signupIntro: "Crea una cuenta gratis para guardar tus recetas y planes de comidas.",
    displayName: "Nombre",
    optional: "opcional",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    passwordHint: `Al menos ${minPasswordLength} caracteres.`,
    loginButton: "Iniciar sesión",
    signupButton: "Crear cuenta",
    pending: "Espera un momento…",
    noAccount: "¿No tienes cuenta?",
    haveAccount: "¿Ya tienes cuenta?",
    goToSignup: "Crea una",
    goToLogin: "Inicia sesión",
    signOut: "Cerrar sesión",
    checkEmail: "¡Cuenta creada! Revisa tu correo y haz clic en el enlace de confirmación; luego inicia sesión.",
    errors: {
      missingFields: "Completa todos los campos obligatorios.",
      invalidEmail: "Ingresa un correo electrónico válido.",
      passwordTooShort: `La contraseña debe tener de ${minPasswordLength} a 72 caracteres.`,
      passwordMismatch: "Las contraseñas no coinciden.",
      invalidCredentials: "El correo o la contraseña son incorrectos.",
      emailNotConfirmed: "Primero confirma tu correo. Revisa tu bandeja de entrada.",
      emailTaken: "Ya existe una cuenta con este correo.",
      weakPassword: "La contraseña es muy débil. Prueba una más larga.",
      rateLimited: "Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
      unavailable: "El inicio de sesión no está disponible. Inténtalo de nuevo.",
    },
  },
  "pt-BR": {
    loginTitle: "Entrar",
    loginIntro: "Bem-vindo de volta! Entre para salvar suas receitas e planos de refeições.",
    signupTitle: "Criar conta",
    signupIntro: "Crie uma conta grátis para salvar suas receitas e planos de refeições.",
    displayName: "Nome",
    optional: "opcional",
    email: "E-mail",
    password: "Senha",
    confirmPassword: "Confirmar senha",
    passwordHint: `Pelo menos ${minPasswordLength} caracteres.`,
    loginButton: "Entrar",
    signupButton: "Criar conta",
    pending: "Aguarde…",
    noAccount: "Não tem uma conta?",
    haveAccount: "Já tem uma conta?",
    goToSignup: "Crie uma",
    goToLogin: "Entrar",
    signOut: "Sair",
    checkEmail: "Conta criada! Verifique seu e-mail e clique no link de confirmação; depois entre.",
    errors: {
      missingFields: "Preencha todos os campos obrigatórios.",
      invalidEmail: "Digite um e-mail válido.",
      passwordTooShort: `A senha deve ter de ${minPasswordLength} a 72 caracteres.`,
      passwordMismatch: "As senhas não coincidem.",
      invalidCredentials: "E-mail ou senha incorretos.",
      emailNotConfirmed: "Confirme seu e-mail primeiro. Verifique sua caixa de entrada.",
      emailTaken: "Já existe uma conta com este e-mail.",
      weakPassword: "Essa senha é muito fraca. Tente uma mais longa.",
      rateLimited: "Muitas tentativas. Aguarde um minuto e tente novamente.",
      unavailable: "O login está indisponível agora. Tente novamente.",
    },
  },
};
