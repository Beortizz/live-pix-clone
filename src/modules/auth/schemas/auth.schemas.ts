import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  name: z.string().min(2, { message: 'Nome deve ter ao menos 2 caracteres' }),
  password: z
    .string()
    .min(8, { message: 'Senha deve ter ao menos 8 caracteres' }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;