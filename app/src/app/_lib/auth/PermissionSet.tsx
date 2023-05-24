export type PermissionSet = {
  resource: string;
  operation: string;
  attributes?: PermissionSetAttribute[];
};

export type PermissionSetAttribute = {
  key: string;
  value: string | boolean;
};
