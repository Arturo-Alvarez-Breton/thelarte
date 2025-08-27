package com.thelarte.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String JWT_COOKIE_NAME = "jwt_token";
    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    private final JwtTokenProvider tokenProvider;

    public JwtFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = resolveToken(request);
        String requestURI = request.getRequestURI();

        if (StringUtils.hasText(jwt)) {
            try {
                if (tokenProvider.validateToken(jwt)) {
                    Authentication authentication = tokenProvider.getAuthentication(jwt);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("Successfully authenticated user for URI: {}", requestURI);
                } else {
                    logger.debug("Invalid JWT token for URI: {}", requestURI);
                    // Clear invalid cookie if it exists
                    clearInvalidTokenCookie(request, response);
                }
            } catch (Exception e) {
                logger.warn("JWT token processing failed for URI: {}", requestURI, e);
                SecurityContextHolder.clearContext();
                clearInvalidTokenCookie(request, response);
            }
        } else {
            logger.debug("No JWT token found for URI: {}", requestURI);
        }
        
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        // First try to get token from Authorization header (for API calls)
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }

        // If not found in header, try to get from cookies (for browser navigation)
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (JWT_COOKIE_NAME.equals(cookie.getName())) {
                    String tokenValue = cookie.getValue();
                    if (StringUtils.hasText(tokenValue)) {
                        return tokenValue;
                    }
                }
            }
        }

        return null;
    }

    private void clearInvalidTokenCookie(HttpServletRequest request, HttpServletResponse response) {
        // Only clear cookie if it actually exists to avoid unnecessary Set-Cookie headers
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (JWT_COOKIE_NAME.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                    Cookie clearCookie = new Cookie(JWT_COOKIE_NAME, "");
                    clearCookie.setPath("/");
                    clearCookie.setMaxAge(0);
                    clearCookie.setHttpOnly(true);
                    response.addCookie(clearCookie);
                    logger.debug("Cleared invalid JWT cookie");
                    break;
                }
            }
        }
    }
}
