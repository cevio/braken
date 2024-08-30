export class Exception extends Error {
  public readonly status: number;
  public readonly timestamp = Date.now();
  constructor(status: number, msg?: string) {
    super(msg);
    this.status = status;
  }
}