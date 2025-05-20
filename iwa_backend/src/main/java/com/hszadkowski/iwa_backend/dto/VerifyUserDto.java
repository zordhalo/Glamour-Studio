package com.hszadkowski.iwa_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@NoArgsConstructor
public class VerifyUserDto {

    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    private String verificationCode;
}
