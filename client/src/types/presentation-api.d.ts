// TypeScript declarations for the Presentation API

interface PresentationAvailability {
  value: boolean;
  onchange: EventListener | null;
}

interface PresentationConnectionAvailableEvent extends Event {
  connection: PresentationConnection;
}

interface PresentationConnection {
  id: string;
  url: string;
  state: PresentationConnectionState;
  onconnect: EventListener | null;
  onclose: EventListener | null;
  onterminate: EventListener | null;
  onmessage: EventListener | null;
  close(): void;
  terminate(): void;
  send(message: string): void;
  send(data: ArrayBuffer): void;
  send(data: ArrayBufferView): void;
}

type PresentationConnectionState = 'connecting' | 'connected' | 'closed' | 'terminated';

interface PresentationRequest extends EventTarget {
  new(urls: string[]): PresentationRequest;
  start(): Promise<PresentationConnection>;
  reconnect(presentationId: string): Promise<PresentationConnection>;
  getAvailability(): Promise<PresentationAvailability>;
  onconnectionavailable: ((event: PresentationConnectionAvailableEvent) => void) | null;
}

interface Presentation {
  defaultRequest: PresentationRequest | null;
  receiver: PresentationReceiver | null;
}

interface PresentationReceiver {
  connectionList: Promise<PresentationConnectionList>;
}

interface PresentationConnectionList extends EventTarget {
  connections: ReadonlyArray<PresentationConnection>;
  onconnectionavailable: ((event: PresentationConnectionAvailableEvent) => void) | null;
}

interface Navigator {
  presentation?: Presentation;
}

declare var PresentationRequest: {
  prototype: PresentationRequest;
  new(urls: string[]): PresentationRequest;
};