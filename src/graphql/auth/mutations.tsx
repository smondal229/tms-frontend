import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
      refreshToken
      username
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
    }
  }
`;

export const SIGNUP = gql`
  mutation Signup($signupInput: SignupInput!) {
    signup(signupInput: $signupInput)
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      verifiedEmail
      success
    }
  }
`;

export const RESEND_VERIFICATION = gql`
  mutation ResendVerification($username: String!) {
    resendVerificationEmail(username: $username)
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($username: String!) {
    requestPasswordReset(username: $username)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      username
      success
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`;

export const CHANGE_ACTIVE_STATUS = gql`
  mutation ChangeActiveStatus($userId: ID!, $activeStatus: Boolean!) {
    changeActiveStatus(userId: $userId, activeStatus: $activeStatus)
  }
`;
