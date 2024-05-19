export type ServerActionResponse = Readonly<{
  status: number;
  errorMessage?: string;
}>;

export type ServerAction<PayloadGeneric> = (
  payload: PayloadGeneric,
) => Promise<ServerActionResponse>;
