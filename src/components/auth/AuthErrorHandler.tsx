import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, XCircle, InfoIcon } from 'lucide-react';

type ErrorType = 'error' | 'warning' | 'info';

interface ErrorMessage {
  type: ErrorType;
  title: string;
  message: string;
}

const getErrorDetails = (error: string): ErrorMessage => {
  // Handle standard NextAuth errors
  switch (error) {
    case 'Configuration':
      return {
        type: 'error',
        title: 'Server Configuration Error',
        message: 'There is a problem with the server configuration. Please contact support.'
      };
    case 'AccessDenied':
      return {
        type: 'error',
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.'
      };
    case 'Verification':
      return {
        type: 'warning',
        title: 'Verification Required',
        message: 'The verification link is invalid or has expired. Please request a new verification link.'
      };
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
    case 'EmailCreateAccount':
    case 'Callback':
    case 'OAuthAccountNotLinked':
      return {
        type: 'error',
        title: 'Authentication Error',
        message: 'There was a problem with the authentication service. Please try again.'
      };
    case 'EmailSignin':
      return {
        type: 'warning',
        title: 'Email Sign-in Failed',
        message: 'The email sign-in link is invalid or has expired. Please request a new sign-in link.'
      };
    case 'CredentialsSignin':
      return {
        type: 'error',
        title: 'Invalid Credentials',
        message: 'The email or password you entered is incorrect. Please try again.'
      };
    case 'SessionRequired':
      return {
        type: 'warning',
        title: 'Authentication Required',
        message: 'You must be signed in to access this page.'
      };
    case 'Default':
    default:
      // Handle custom errors (assuming they're in the format "Error: message")
      if (error.startsWith('Error:')) {
        const customMessage = error.substring(7);
        return {
          type: 'error',
          title: 'Authentication Error',
          message: customMessage
        };
      }

      return {
        type: 'error',
        title: 'Authentication Error',
        message: 'An unexpected authentication error occurred. Please try again.'
      };
  }
};

const getIcon = (type: ErrorType) => {
  switch (type) {
    case 'error':
      return <XCircle className="h-5 w-5" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5" />;
    case 'info':
      return <InfoIcon className="h-5 w-5" />;
    default:
      return <AlertCircle className="h-5 w-5" />;
  }
};

const getVariant = (type: ErrorType) => {
  switch (type) {
    case 'error':
      return 'destructive';
    case 'warning':
      return 'default';
    case 'info':
      return 'default';
    default:
      return 'destructive';
  }
};

export function AuthErrorHandler() {
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<ErrorMessage | null>(null);

  useEffect(() => {
    const error = searchParams?.get('error');
    if (error) {
      const details = getErrorDetails(error);
      setErrorDetails(details);
    } else {
      setErrorDetails(null);
    }
  }, [searchParams]);

  if (!errorDetails) return null;

  return (
    <Alert variant={getVariant(errorDetails.type) as any} className="mb-6">
      <div className="flex items-start">
        {getIcon(errorDetails.type)}
        <div className="ml-2">
          <AlertTitle>{errorDetails.title}</AlertTitle>
          <AlertDescription>{errorDetails.message}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

export default AuthErrorHandler; 