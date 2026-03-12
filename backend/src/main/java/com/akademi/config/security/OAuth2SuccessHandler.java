package com.akademi.config.security;

import com.akademi.enums.Role;
import com.akademi.model.User;
import com.akademi.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @Value("${akademi.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        // Find or create user in our database
        User user;
        if (userService.existsByEmail(email)) {
            user = userService.getUserByEmail(email);
        } else {
            // First time Google login — create account automatically
            user = User.builder()
                    .email(email)
                    .name(name)
                    .profilePicture(picture)
                    .role(Role.STUDENT)
                    .oauthProvider("google")
                    .oauthId(oAuth2User.getAttribute("sub"))
                    .active(true)
                    .build();
            user = userService.saveUser(user);
            log.info("New user registered via Google OAuth: {}", email);
        }

        // Generate JWT token for the user
        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        // Redirect to frontend with tokens as query params
        String targetUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("token", token)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        log.info("OAuth2 login successful for user: {}", email);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
