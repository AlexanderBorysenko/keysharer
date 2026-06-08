export type TPasswordValidation = {
    valid: boolean;
    requirements: {
        requirement: string;
        fulfilled: boolean;
    }[];
}

export const validatePassword = (password: string): TPasswordValidation => {
    const requirements = [
        {
            requirement: 'Minimum 8 characters',
            fulfilled: password.length >= 8,
        },
        {
            requirement: 'Contains at least one uppercase letter',
            fulfilled: /[A-Z]/.test(password),
        },
        {
            requirement: 'Contains at least one lowercase letter',
            fulfilled: /[a-z]/.test(password),
        },
        {
            requirement: 'Contains at least one number',
            fulfilled: /\d/.test(password),
        },
        {
            requirement: 'Contains at least one special character',
            fulfilled: /[!@#$%^&*()_+~`|}{[\]:;?><,.\\/\-=]/.test(password),
        },
    ];

    const valid = requirements.every(req => req.fulfilled);

    return {
        valid,
        requirements,
    };
}