package com.hszadkowski.iwa_backend.services.interfaces;

import com.hszadkowski.iwa_backend.dto.FacebookUserDto;

public interface FacebookService {
    boolean validateFacebookToken(String accessToken);

    FacebookUserDto getFacebookUserInfo(String accessToken);
}