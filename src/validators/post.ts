import {z} from 'zod';

export const createPostSchema = z.object({
  title: z.string({
    message: 'title is required',
  }),
  description: z.string({
    message: 'description is required',
  }),
  image: z
    .string()
    .url({
      message: 'image URL is invalid',
    })
    .optional(),
  private: z.boolean().optional(),
});

export const createPostValidator = async (
  postBody: z.infer<typeof createPostSchema>
) => {
  const result = await createPostSchema.safeParseAsync(postBody);

  const errorMessage = result.error?.errors.at(0)?.message;

  return errorMessage;
};
