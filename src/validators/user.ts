import {z} from 'zod';

export const createUserSchema = z.object({
  email: z
    .string({message: 'email field is required'})
    .email({message: 'Invalid email'}),
  password: z
    .string({message: 'password field is required'})
    .min(6, {message: 'passowrd must contain at least 6 characters'})
    .max(12, {message: 'password must not contains more than 12 characters'}),
  firstName: z.string({message: 'firstName field  is required'}),
  lastName: z.string({message: 'lastName field is required'}),
  userName: z.string({message: 'userName  field is required'}),
});

export const createUserValidator = async (body: any) => {
  const result = await createUserSchema.safeParseAsync(body);

  const errorMessage = result.error?.errors.at(0)?.message;

  return errorMessage;
};
