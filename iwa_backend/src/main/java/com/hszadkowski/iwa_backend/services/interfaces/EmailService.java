package com.hszadkowski.iwa_backend.services.interfaces;

import jakarta.mail.MessagingException;

public interface EmailService {

    void sendVerificationEmail(String to, String subject, String text) throws MessagingException;
}
