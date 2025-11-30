// Updated to declare process.env.API_KEY as per guidelines
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
    }
  }
}

export {};
