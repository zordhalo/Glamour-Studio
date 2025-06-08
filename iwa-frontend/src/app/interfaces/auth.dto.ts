export interface LoginResponseDto {
  token: string;
  expiresIn: number;
}

export interface GoogleUserDto {
  id: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  accessToken: string;
}

export interface FacebookUserDto {
  id: string;
  email: string;
  name: string;
  accessToken: string;
}

export interface OAuthAuthenticationDto {
  provider: string;
  accessToken: string;
}
