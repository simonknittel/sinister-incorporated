import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

/** The region of the event bus of SAM */
const REGION = "eu-central-1";

/** The maximum time to open a connection to EventBridge */
const CONNECTION_TIMEOUT_MILLISECONDS = 3_000;

/**
 * The maximum time of one request with its response. The SDK tries a failed
 * request again (by default three attempts in total).
 */
const REQUEST_TIMEOUT_MILLISECONDS = 10_000;

export interface EventBridgeClientOptions {
  /**
   * Static credentials. Without them, the SDK uses the credentials of the
   * runtime, for example the role of a Lambda function.
   */
  readonly credentials?: {
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
  };
}

export const createEventBridgeClient = ({
  credentials,
}: EventBridgeClientOptions): EventBridgeClient =>
  new EventBridgeClient({
    region: REGION,
    credentials,
    requestHandler: {
      connectionTimeout: CONNECTION_TIMEOUT_MILLISECONDS,
      requestTimeout: REQUEST_TIMEOUT_MILLISECONDS,
      // Without this option, the SDK only logs a warning when the request
      // timeout is over, and the request continues
      throwOnRequestTimeout: true,
    },
  });
