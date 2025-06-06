package com.hszadkowski.iwa_backend.services.interfaces;

import com.hszadkowski.iwa_backend.dto.GoogleUserDto;

public interface GoogleAuthService {
    boolean validateGoogleToken(String accessToken);
    GoogleUserDto getGoogleUserInfo(String accessToken);
}
