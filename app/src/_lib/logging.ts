const info = (message: string, args: Record<string, unknown>) => {
  console.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      ...args,
    }),
  );
};

const warn = (message: string, args: Record<string, unknown>) => {
  console.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      ...args,
    }),
  );
};

const error = (message: string, args: Record<string, unknown>) => {
  console.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      ...args,
    }),
  );
};

export const log = {
  info,
  warn,
  error,
};
