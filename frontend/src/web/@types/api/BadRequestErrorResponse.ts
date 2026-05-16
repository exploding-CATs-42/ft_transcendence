export interface BadRequestErrorResponse<FieldName extends string = string> {
  message: string;
  errors: {
    formErrors: string[];
    fieldErrors: Partial<Record<FieldName, string[]>>;
  };
}
