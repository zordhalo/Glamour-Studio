package com.hszadkowski.iwa_backend.services.interfaces;

import com.hszadkowski.iwa_backend.dto.FacebookUserDto;
import com.hszadkowski.iwa_backend.dto.RegisterUserRequestDto;
import com.hszadkowski.iwa_backend.dto.UserResponseDto;

public interface UserService {

    UserResponseDto registerUser(RegisterUserRequestDto request);

    UserResponseDto registerFacebookUser(FacebookUserDto facebookUser);
}
