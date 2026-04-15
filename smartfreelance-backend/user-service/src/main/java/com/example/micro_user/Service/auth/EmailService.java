package com.example.micro_user.Service.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendConfirmationEmail(String to, String token) {
        String link = "http://localhost:4200/confirm?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("Confirm your SmartFreelance account");
        message.setText(
                "Hello,\n\n" +
                        "Thank you for signing up on SmartFreelance!\n\n" +
                        "Please click the link below to confirm your email address:\n\n" +
                        link + "\n\n" +
                        "This link expires in 24 hours.\n\n" +
                        "If you did not create an account, please ignore this email.\n\n" +
                        "SmartFreelance Team"
        );

        mailSender.send(message);
    }
}