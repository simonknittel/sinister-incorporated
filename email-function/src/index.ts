import { Handler } from "aws-lambda";
import { myModule } from "./_lib/myModule";

export const handler: Handler = async (event, context) => {
  return myModule();
};
