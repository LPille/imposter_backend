import { Application } from "express";

export class ImposterServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.startServer(this.app);
  }

  private async startServer(app: Application): Promise<void> {}
}
