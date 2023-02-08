export class LocalError {
  constructor(public id: number, public parent: string, public error: string) {}
}

export class ErrorHandler {
  private errors: Array<LocalError>;
  private errorCounter: number = 0;
  constructor() {
    this.errors = [];
  }

  addError(error: LocalError) {
    this.errors.push(error);
  }

  createError(parent: string, error: string): LocalError {
    this.errorCounter += 1;
    return new LocalError(this.errorCounter, parent, error);
  }

  getErrorsFromParent(parent: string): Array<LocalError> {
    let foundError: Array<LocalError> = [];
    this.errors.forEach(error => {
      if (error.parent === parent) {
        foundError.push(error);
      }
    });
    return foundError;
  }
}
