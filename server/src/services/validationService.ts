import { throwUserInputError } from '../errors/throwUserInputError';

export type ValidationRule = (value: any) => string | null | Promise<string | null>;

export interface ValidationSchema {
    [key: string]: ValidationRule[];
}

export class ValidationService {
    constructor() { }

    static async validate(schema: ValidationSchema, data: { [key: string]: any }) {
        const errors: { [key: string]: string } = {};

        try {
            for (const field in schema) {
                const rules = schema[field];
                const value = data[field];

                for (const rule of rules) {
                    const errorMessage = await rule(value);
                    if (errorMessage) {
                        errors[field] = errorMessage;
                        break; // Якщо потрібно зібрати всі помилки, приберіть цей `break`
                    }
                }
            }

        }
        catch (e: any) {
            throwUserInputError('Validation Error', { messages: { error: e.message } });
        }
        if (Object.keys(errors).length > 0) {
            throwUserInputError('Validation Error', { messages: errors });
        }
    }
}

export const validationService = new ValidationService();
