package com.localservicefinder.service;

import com.localservicefinder.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendBookingConfirmation(String toEmail, Booking booking) {
        if (mailSender == null) {
            System.out.println("Email service not configured. Booking confirmation email would be sent to: " + toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Booking Confirmation - Local Service Finder");
            message.setText(String.format(
                "Dear %s,\n\n" +
                "Your booking has been confirmed!\n\n" +
                "Service: %s\n" +
                "Date & Time: %s\n" +
                "Status: %s\n" +
                "Notes: %s\n\n" +
                "Thank you for using Local Service Finder!",
                booking.getUser().getFullName(),
                booking.getService().getTitle(),
                booking.getBookingDate().toString(),
                booking.getStatus(),
                booking.getNotes() != null ? booking.getNotes() : "None"
            ));

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
