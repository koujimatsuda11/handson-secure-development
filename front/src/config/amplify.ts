import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { sessionStorage } from 'aws-amplify/utils';

cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage);

const resolveEndpoint = (endpoint?: string): string | undefined => {
  if (!endpoint) {
    return import.meta.env.DEV && typeof window !== 'undefined'
      ? `${window.location.origin}/cognito`
      : undefined;
  }

  return endpoint.startsWith('/') && typeof window !== 'undefined'
    ? `${window.location.origin}${endpoint}`
    : endpoint;
};

const userPoolEndpoint = resolveEndpoint(import.meta.env.VITE_COGNITO_ENDPOINT);

const amplifyConfig = {
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION,
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      ...(userPoolEndpoint ? { userPoolEndpoint } : {}),
      loginWith: {
        username: true,
        email: true,
      },
      signUpVerificationMethod: 'code' as const,
      userAttributes: {
        email: {
          required: true,
        },
        nickname: {
          required: false,
        },
      },
    },
  },
};

export const awsConfig = {
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;
