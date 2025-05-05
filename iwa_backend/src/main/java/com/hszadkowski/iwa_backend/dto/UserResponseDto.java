package com.hszadkowski.iwa_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponseDto {
    private Integer id;
    private String name;
    private String surname;
    private String email;
    private String phoneNum;
    private String role;
}