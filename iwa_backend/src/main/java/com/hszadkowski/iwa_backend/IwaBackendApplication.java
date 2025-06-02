package com.hszadkowski.iwa_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IwaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(IwaBackendApplication.class, args);
    }

}
