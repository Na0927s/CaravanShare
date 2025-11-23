import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;

export class KakaoAuthService {
  getAuthorizationUrl(): string {
    const params = {
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      response_type: 'code',
      scope: 'profile_nickname', // Request only nickname
    };
    const queryString = new URLSearchParams(params as any).toString();
    return `https://kauth.kakao.com/oauth/authorize?${queryString}`;
  }

  async getAccessToken(code: string): Promise<string> {
    const params = {
      grant_type: 'authorization_code',
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      code,
      client_secret: KAKAO_CLIENT_SECRET,
    };
    const queryString = new URLSearchParams(params as any).toString();
    const response = await axios.post('https://kauth.kakao.com/oauth/token', queryString, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
    return response.data.access_token;
  }

  async getUserProfile(accessToken: string): Promise<any> {
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }
}
