import {z} from 'zod';

export const createCommentSchema = z.object({
  text: z.string({
    message: 'text is required',
  }),
  postId: z.string({
    message: 'postId is required',
  }),
});

export const createCommentValidator = async (
  commentBody: z.infer<typeof createCommentSchema>
) => {
  const result = await createCommentSchema.safeParseAsync(commentBody);

  const errorMessage = result.error?.errors.at(0)?.message;

  return errorMessage;
};
