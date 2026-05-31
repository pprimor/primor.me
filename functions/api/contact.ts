import {
  handleContactPost,
  type ContactEnv,
} from "../lib/contact/handler";

export const onRequestPost: PagesFunction<ContactEnv> = async (context) => {
  return handleContactPost(context.request, context.env);
};
