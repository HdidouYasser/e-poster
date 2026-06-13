package com.eposter.backend.auth;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetPasswordEmail(String toEmail, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token + "&email=" + java.net.URLEncoder.encode(toEmail, java.nio.charset.StandardCharsets.UTF_8);
        String subject = "Réinitialisation de votre mot de passe - E-Poster";
        String content = "<h3>Bonjour,</h3>"
                + "<p>Vous avez demandé la réinitialisation de votre mot de passe pour la plateforme E-Poster.</p>"
                + "<p>Veuillez cliquer sur le lien ci-dessous pour modifier votre mot de passe :</p>"
                + "<p><a href=\"" + resetUrl + "\">Réinitialiser mon mot de passe</a></p>"
                + "<p>Ce lien est valide pendant 15 minutes.</p>"
                + "<br/>"
                + "<p>L'équipe E-Poster</p>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("m.machhouraymane@gmail.com", "E-Poster Platform");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
            logger.info("Email de réinitialisation envoyé avec succès à : {}", toEmail);
        } catch (Exception e) {
            logger.error("Échec de l'envoi de l'email SMTP à {}: {}.", toEmail, e.getMessage());
            // Fallback: log a clear message to console so user can copy-paste the URL in dev/presentation
            System.out.println("==========================================================================");
            System.out.println("[SMTP MAIL FALLBACK] Impossible de se connecter au serveur SMTP.");
            System.out.println("Lien de récupération généré pour " + toEmail + " :");
            System.out.println(resetUrl);
            System.out.println("==========================================================================");
        }
    }

    public void sendPasswordChangedNotificationEmail(String toEmail) {
        String subject = "Modification de votre mot de passe - E-Poster";
        String content = "<h3>Bonjour,</h3>"
                + "<p>Nous vous informons que le mot de passe de votre compte E-Poster a été modifié avec succès.</p>"
                + "<p>Si vous êtes bien à l'origine de cette modification, vous pouvez ignorer cet e-mail.</p>"
                + "<p><strong>Si vous n'avez pas demandé cette modification</strong>, veuillez réinitialiser votre mot de passe immédiatement ou contacter l'administrateur.</p>"
                + "<br/>"
                + "<p>L'équipe E-Poster</p>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("m.machhouraymane@gmail.com", "E-Poster Platform");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
            logger.info("Email de confirmation de changement de mot de passe envoyé à : {}", toEmail);
        } catch (Exception e) {
            logger.error("Échec de l'envoi de l'email SMTP de notification à {}: {}.", toEmail, e.getMessage());
            System.out.println("==========================================================================");
            System.out.println("[SMTP MAIL FALLBACK] Notification de changement de mot de passe pour : " + toEmail);
            System.out.println("==========================================================================");
        }
    }
}
