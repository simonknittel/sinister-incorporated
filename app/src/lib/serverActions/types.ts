export type ServerActionResponse = Readonly<{
  status: number;
  message?: string;
}>;

export type ServerAction<PayloadGeneric> = (
  payload: PayloadGeneric,
) => Promise<ServerActionResponse>;
